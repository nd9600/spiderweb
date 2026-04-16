import {createStore, Store} from "vuex";
import type {ActionContext, ActionTree, GetterTree, MutationTree, StoreOptions} from "vuex";

import settingsModule from "./modules/settingsModule";
import firebaseModule from "./modules/firebaseModule";
import dataModule from "./modules/dataModule";
import clickerModule from "./modules/clickerModule";

import {STORAGE_KEY} from "@/src/commonComponents/constants";
import firebaseDbFactory from "./firebaseDbFactory";
import debounce from "lodash/debounce";
import type {
    ImportedStorageObject,
    OfflineStorageObject,
    OfflineStorageObjectSerialised,
    RootStoreState,
    RootUiState,
    ShouldTakeDataFrom
} from "@/src/@types/StoreTypes";

const isProduction = process.env.NODE_ENV === "production";

type RootActionContext = ActionContext<RootUiState, RootStoreState>;

interface ImportSettingsPayload {
    storageObject: ImportedStorageObject;
    shouldTakeDataFrom: Nullable<ShouldTakeDataFrom>;
}

const state: RootUiState = {
    loadingApp: true,
    failedToLoadData: false,
    isRenderingGraph: false
};

const getters: GetterTree<RootStoreState, RootStoreState> = {
    storageObject(state): OfflineStorageObject {
        return {
            dataModule: state.dataModule,
            settingsModule: state.settingsModule,
            firebaseModule: state.firebaseModule,
        };
    }
};

const mutations: MutationTree<RootUiState> = {
    setLoadingApp(state, loadingApp: boolean) {
        state.loadingApp = loadingApp;
    },
    setFailedToLoadData(state, failedToLoadData: boolean) {
        state.failedToLoadData = failedToLoadData;
    },
    setIsRenderingGraph(state, isRenderingGraph: boolean) {
        state.isRenderingGraph = isRenderingGraph;
    },
};

const actions: ActionTree<RootUiState, RootStoreState> = {
    async saveStateToLocalStorage(context: RootActionContext) {
        const storageObject = context.getters.storageObject as OfflineStorageObject;
        const stringifiedStorage = JSON.stringify(storageObject);
        localStorage.setItem(STORAGE_KEY, stringifiedStorage);
    },
    async saveStateToStorage(context: RootActionContext) {
        const storageObject = context.getters.storageObject as OfflineStorageObject;
        const stringifiedStorage = JSON.stringify(storageObject);

        localStorage.setItem(STORAGE_KEY, stringifiedStorage);

        const remoteStorageMethod = context.rootState.settingsModule.remoteStorageMethod;
        switch (remoteStorageMethod) {
            case "firebase": {
                const firebaseDB = firebaseDbFactory(context.rootState.firebaseModule.firebaseConfig);
                firebaseDB.ref(STORAGE_KEY).set(stringifiedStorage);
                break;
            }
            default:
                break;
        }
    },
    async loadStateFromStorage(context: RootActionContext) {
        const localStorageItem = localStorage.getItem(STORAGE_KEY);
        if (localStorageItem === null) {
            context.commit("setLoadingApp", false);
            return;
        }
        const localStorageObject = JSON.parse(localStorageItem) as ImportedStorageObject;

        const remoteStorageMethod = localStorageObject.settingsModule?.remoteStorageMethod;
        switch (remoteStorageMethod) {
            case "firebase": {
                try {
                    let loadedDataSuccesfully = false;
                    const firebaseDB = firebaseDbFactory(localStorageObject.firebaseModule!.firebaseConfig);
                    firebaseDB.ref(STORAGE_KEY).once("value")
                        .then(
                            (snapshot: {val(): string}) => {
                                const firebaseStorageObject = JSON.parse(snapshot.val()) as Nullable<ImportedStorageObject>;
                                if (firebaseStorageObject !== null) {
                                    context.dispatch("importState", firebaseStorageObject);
                                    loadedDataSuccesfully = true;
                                    context.commit("setLoadingApp", false);
                                } else {
                                    context.commit("setFailedToLoadData", true);
                                }
                            }
                        ).catch((error: unknown) => {
                            console.log(error);
                            alert("There was an error loading the state from Firebase, please refresh the page/change your Firebase config in 'settings', and try again");
                        });

                    setTimeout(
                        () => {
                            if (!loadedDataSuccesfully) {
                                context.commit("setFailedToLoadData", true);
                            }
                        },
                        10000
                    );
                } catch (error) {
                    context.commit("settingsModule/setRemoteStorageMethod", "none", {root: true});
                    context.commit("setLoadingApp", false);
                    alert(error);
                    return;
                }
                break;
            }
            case "none":
            default: {
                context.dispatch("importState", localStorageObject);
                context.commit("setLoadingApp", false);
                break;
            }
        }
    },

    async loadDataFrom(context: RootActionContext, shouldTakeDataFrom: Nullable<ShouldTakeDataFrom>) {
        switch (shouldTakeDataFrom) {
            case "local": {
                const localStorageItem = localStorage.getItem(STORAGE_KEY);
                if (localStorageItem === null) {
                    return;
                }
                const localStorageObject = JSON.parse(localStorageItem) as ImportedStorageObject;
                context.dispatch("importData", localStorageObject);
                break;
            }
            case "firebase": {
                context.commit("setLoadingApp", true);
                try {
                    const firebaseDB = firebaseDbFactory(context.rootState.firebaseModule.firebaseConfig);
                    const firebaseSnapshot = await firebaseDB.ref(STORAGE_KEY).once("value");
                    const firebaseStorageObject = JSON.parse(firebaseSnapshot.val()) as ImportedStorageObject;
                    await context.dispatch("importData", firebaseStorageObject);
                } catch (error) {
                    console.log(error);
                    alert("There was an error loading the data from Firebase, please refresh the page/change your Firebase config in 'settings', and try again");
                }
                context.commit("setLoadingApp", false);
                break;
            }
            default: {
                break;
            }
        }
    },

    async importState(context: RootActionContext, storageObject: ImportedStorageObject) {
        if (storageObject.dataModule || storageObject.postsModule) { // was changed from "postsModule" to "dataModule" in v0.4
            context.commit("dataModule/setState", storageObject.dataModule || storageObject.postsModule, {root: true});
        }

        if (storageObject.settingsModule) {
            context.commit("settingsModule/setState", storageObject.settingsModule, {root: true});
        }
        if (storageObject.firebaseModule) {
            context.commit("firebaseModule/setState", storageObject.firebaseModule, {root: true});
        }
    },
    async importData(context: RootActionContext, storageObject: ImportedStorageObject) {
        if (storageObject.dataModule) {
            context.commit("dataModule/setState", storageObject.dataModule, {root: true});
        }
    },
    async importSettings(context: RootActionContext, {storageObject, shouldTakeDataFrom}: ImportSettingsPayload) {
        const isStorageMethodChanging = context.rootState.settingsModule.remoteStorageMethod !== storageObject.settingsModule?.remoteStorageMethod;

        if (storageObject.settingsModule) {
            context.commit("settingsModule/setState", storageObject.settingsModule, {root: true});
        }
        if (storageObject.firebaseModule) {
            context.commit("firebaseModule/setState", storageObject.firebaseModule, {root: true});
        }

        if (isStorageMethodChanging) {
            await context.dispatch("loadDataFrom", shouldTakeDataFrom);
        }
    }
};

const storeOptions: StoreOptions<RootStoreState> = {
    strict: !isProduction,
    modules: {
        settingsModule,
        firebaseModule,
        dataModule,
        clickerModule
    },
    state: state as RootStoreState,
    getters,
    mutations: mutations as MutationTree<RootStoreState>,
    actions,
};

const store = createStore(storeOptions);

const saveToFirebase = debounce(
    (state: RootStoreState, stringifiedStorage: string) => {
        const shouldSaveToFirebase = state.settingsModule.remoteStorageMethod === "firebase";
        if (shouldSaveToFirebase) {
            const firebaseDB = firebaseDbFactory(state.firebaseModule.firebaseConfig);
            firebaseDB.ref(STORAGE_KEY).set(stringifiedStorage);
        }
    },
    250,
    {
        "leading": false,
        "trailing": true,
    }
);

const subscriber = async (mutation: {type: string}, state: RootStoreState) => {
    const mutationsToIgnore = [
        "setLoadingApp",
        "setFailedToLoadData",
        "setIsRenderingGraph",
        "settingsModule/setRemoteStorageMethod"
    ];
    const shouldSaveState = state.settingsModule.shouldAutosave
        && !mutationsToIgnore.includes(mutation.type)
        && !mutation.type.endsWith("/setState")
        && !mutation.type.startsWith("clickerModule/");

    if (!isProduction) {
        console.log(mutation.type);
    }

    if (!shouldSaveState) {
        return;
    }

    const storageObject: OfflineStorageObjectSerialised = {
        dataModule: state.dataModule,
        settingsModule: state.settingsModule,
        firebaseModule: state.firebaseModule,
    };
    const stringifiedStorage = JSON.stringify(storageObject);

    if (!isProduction) {
        console.log("autosaving, mutation is", mutation.type);
    }

    localStorage.setItem(STORAGE_KEY, stringifiedStorage);
    saveToFirebase(state, stringifiedStorage);
};

store.subscribe(subscriber);

export default store as Store<RootStoreState>;
