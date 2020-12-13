import Vue from "vue";
import Vuex from "vuex";

import settingsModule from "./modules/settingsModule";
import firebaseModule from "./modules/firebaseModule";
import dataModule from "./modules/dataModule";
import clickerModule from "./modules/clickerModule";

import {STORAGE_KEY} from "@/src/commonComponents/constants";

import firebaseDbFactory from "./firebaseDbFactory";
import debounce from "lodash/debounce";

Vue.use(Vuex);

const isProduction = process.env.NODE_ENV === "production";

const store = new Vuex.Store({
    strict: !isProduction,
    modules: {
        settingsModule,
        firebaseModule,
        dataModule,
        clickerModule
    },
    state: {
        loadingApp: true,
        failedToLoadData: false,
        isRenderingGraph: false
    },
    getters: {
        storageObject(state) {
            return {
                dataModule: state.dataModule,
                settingsModule: state.settingsModule,
                firebaseModule: state.firebaseModule,
            };
        }
    },
    mutations: {
        setLoadingApp(state, loadingApp) {
            state.loadingApp = loadingApp;
        },
        setFailedToLoadData(state, failedToLoadData) {
            state.failedToLoadData = failedToLoadData;
        },
        setIsRenderingGraph(state, isRenderingGraph) {
            state.isRenderingGraph = isRenderingGraph;
        },
    },
    actions: {
        async saveStateToLocalStorage(context) {
            const storageObject = context.getters.storageObject;
            const stringifiedStorage = JSON.stringify(storageObject);
            localStorage.setItem(STORAGE_KEY, stringifiedStorage);
        },
        async saveStateToStorage(context) {
            const storageObject = context.getters.storageObject;
            const stringifiedStorage = JSON.stringify(storageObject);

            localStorage.setItem(STORAGE_KEY, stringifiedStorage);

            const remoteStorageMethod = context.state.settingsModule.remoteStorageMethod;
            switch (remoteStorageMethod) {
                case "firebase": {
                    const firebaseDB = firebaseDbFactory(context.state.firebaseModule.firebaseConfig);
                    firebaseDB.ref(STORAGE_KEY).set(stringifiedStorage);
                    break;
                }
                default:
                    break;
            }
        },
        async loadStateFromStorage(context) {
            const localStorageItem = localStorage.getItem(STORAGE_KEY);
            if (localStorageItem === null) {
                context.commit("setLoadingApp", false);
                return;
            }
            const localStorageObject = JSON.parse(localStorageItem);

            const remoteStorageMethod = localStorageObject.settingsModule.remoteStorageMethod;
            switch (remoteStorageMethod) {
                case "firebase": {
                    try {
                        let loadedDataSuccesfully = false;
                        const firebaseDB = firebaseDbFactory(localStorageObject.firebaseModule.firebaseConfig);
                        firebaseDB.ref(STORAGE_KEY).once("value")
                            .then(
                                (snapshot) => {
                                    const firebaseStorageObject = JSON.parse(snapshot.val());
                                    if (firebaseStorageObject !== null) {
                                        context.dispatch("importState", firebaseStorageObject);
                                        loadedDataSuccesfully = true;
                                        context.commit("setLoadingApp", false);
                                    } else {
                                        context.commit("setFailedToLoadData", true);
                                    }
                                }
                            ).catch((error) => {
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

        async loadDataFrom(context, shouldTakeDataFrom) {
            switch (shouldTakeDataFrom) {
                case "local": {
                    const localStorageItem = localStorage.getItem(STORAGE_KEY);
                    if (localStorageItem === null) {
                        return;
                    }
                    const localStorageObject = JSON.parse(localStorageItem);
                    context.dispatch("importData", localStorageObject);
                    break;
                }
                case "firebase": {
                    context.commit("setLoadingApp", true);
                    try {
                        const firebaseDB = firebaseDbFactory(context.state.firebaseModule.firebaseConfig);
                        const firebaseSnapshot = await firebaseDB.ref(STORAGE_KEY).once("value");
                        const firebaseStorageObject = JSON.parse(firebaseSnapshot.val());
                        await context.dispatch("importData", firebaseStorageObject);
                    } catch(error) {
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

        async importState(context, storageObject) {
            if (storageObject.dataModule || storageObject.postsModule) { // was changed from "postsModule" to "dataModule" in v0.4
                context.commit("dataModule/setState", storageObject.dataModule || storageObject.postsModule);
            }

            if (storageObject.settingsModule) {
                context.commit("settingsModule/setState", storageObject.settingsModule);
            }
            if (storageObject.firebaseModule) {
                context.commit("firebaseModule/setState", storageObject.firebaseModule);
            }
        },
        async importData(context, storageObject) {
            if (storageObject.dataModule) {
                context.commit("dataModule/setState", storageObject.dataModule);
            }
        },
        async importSettings(context, {storageObject, shouldTakeDataFrom}) {
            const isStorageMethodChanging = context.state.settingsModule.remoteStorageMethod !== storageObject.settingsModule.remoteStorageMethod;

            if (storageObject.settingsModule) {
                context.commit("settingsModule/setState", storageObject.settingsModule);
            }
            if (storageObject.firebaseModule) {
                context.commit("firebaseModule/setState", storageObject.firebaseModule);
            }

            if (isStorageMethodChanging) {
                await context.dispatch("loadDataFrom", shouldTakeDataFrom);
            }
        }
    }
});

const saveToFirebase = debounce(
    (state, stringifiedStorage) => {
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
const subscriber = async (mutation, state) => {

    const mutationsToIgnore = [
        "setLoadingApp",
        "setFailedToLoadData",
        "setIsRenderingGraph",
        "settingsModule/setRemoteStorageMethod" // see the comment in settingsModule.actions.setRemoteStorageMethod
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

    const storageObject = {
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

export default store;
