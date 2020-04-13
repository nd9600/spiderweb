import Vue from "vue";
import Vuex from "vuex";

import settingsModule from "./modules/settingsModule";
import firebaseModule from "./modules/firebaseModule";
import postsModule from "./modules/postsModule";
import clickerModule from "./modules/clickerModule";

import firebaseDbFactory from "./firebaseDbFactory";

Vue.use(Vuex);

const STORAGE_KEY = "offlineState";

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    modules: {
        settingsModule,
        firebaseModule,
        postsModule,
        clickerModule
    },
    state: {
        loadingApp: true,
        failedToLoadData: false
    },
    getters: {
        storageObject(state) {
            return {
                postsModule: state.postsModule,
                settingsModule: state.settingsModule,
                firebaseModule: state.firebaseModule
            };
        }
    },
    mutations: {
        setLoadingApp(state, loadingApp) {
            state.loadingApp = loadingApp;
        },
        setFailedToLoadData(state, failedToLoadData) {
            state.failedToLoadData = failedToLoadData;
        }
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

            const storageMethod = context.state.settingsModule.storageMethod;
            switch (storageMethod) {
                case "local": {
                    localStorage.setItem(STORAGE_KEY, stringifiedStorage);
                    break;
                }
                case "firebase": {
                    const firebaseDB = firebaseDbFactory(context.state.firebaseModule.firebaseConfig);
                    firebaseDB.ref(STORAGE_KEY).set(stringifiedStorage);
                    break;
                }
            }
        },
        async loadStateFromStorage(context) {
            const localStorageObject = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (localStorageObject === null) {
                context.commit("setLoadingApp", false);
                return;
            }

            const storageMethod = localStorageObject.settingsModule.storageMethod;

            switch (storageMethod) {
                case "local": {
                    context.dispatch("importState", localStorageObject);
                    context.commit("setLoadingApp", false);
                    break;
                }
                case "firebase": {
                    try {
                        let loadedDataSuccesfully = false;
                        const firebaseDB = firebaseDbFactory(localStorageObject.firebaseModule.firebaseConfig);
                        firebaseDB.ref(STORAGE_KEY).once("value")
                            .then(
                                (snapshot) => {
                                    const firebaseStorageObject = JSON.parse(snapshot.val());
                                    context.dispatch("importState", firebaseStorageObject);
                                    context.commit("setLoadingApp", false);
                                    loadedDataSuccesfully = true;
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
                            5000
                        );
                    } catch (error) {
                        context.commit("settingsModule/setStorageMethod", "local", {root: true});
                        context.commit("setLoadingApp", false);
                        alert(error);
                        return;
                    }
                    break;
                }
            }
        },

        async loadDataFrom(context, shouldTakeDataFrom) {
            switch (shouldTakeDataFrom) {
                case "local": {
                    console.log(localStorage.getItem(STORAGE_KEY));
                    const localStorageObject = JSON.parse(localStorage.getItem(STORAGE_KEY));
                    if (localStorageObject === null) {
                        return;
                    }
                    context.dispatch("importData", localStorageObject);
                    break;
                }
                case "firebase": {
                    context.commit("setLoadingApp", true);
                    const firebaseDB = firebaseDbFactory(context.state.firebaseModule.firebaseConfig);
                    firebaseDB.ref(STORAGE_KEY).once("value")
                        .then(
                            (snapshot) => {
                                const firebaseStorageObject = JSON.parse(snapshot.val());
                                console.log(firebaseStorageObject);
                                context.dispatch("importData", firebaseStorageObject);
                            }
                        ).catch((error) => {
                            console.log(error);
                            alert("There was an error loading the data from Firebase, please refresh the page/change your Firebase config in 'settings', and try again");
                        })
                        .finally(() => {
                            context.commit("setLoadingApp", false);
                        });
                    break;
                }
                default: {
                    break;
                }
            }
        },

        async importState(context, storageObject) {
            if (storageObject.postsModule) {
                context.commit("postsModule/setState", storageObject.postsModule);
            }

            if (storageObject.settingsModule) {
                context.commit("settingsModule/setState", storageObject.settingsModule);
            }
            if (storageObject.firebaseModule) {
                context.commit("firebaseModule/setState", storageObject.firebaseModule);
            }
        },
        async importData(context, storageObject) {
            if (storageObject.postsModule) {
                context.commit("postsModule/setState", storageObject.postsModule);
            }
        },
        async importSettings(context, {storageObject, shouldTakeDataFrom}) {
            const isStorageMethodChanging = context.state.settingsModule.storageMethod !== storageObject.settingsModule.storageMethod;

            if (storageObject.settingsModule) {
                context.commit("settingsModule/setState", storageObject.settingsModule);
            }
            if (storageObject.firebaseModule) {
                context.commit("firebaseModule/setState", storageObject.firebaseModule);
            }

            if (isStorageMethodChanging) {
                context.dispatch("loadDataFrom", shouldTakeDataFrom);
            }
        }
    }
});

store.subscribe(
    (mutation, state) => {
        const mutationsToIgnore = [
            "postsModule/setState",
            "settingsModule/setState",
            "settingsModule/setStorageMethod",
            "firebaseModule/setState",
            "setLoadingApp",
            "setFailedToLoadData"
        ];
        const shouldSaveState = state.settingsModule.shouldAutosave
            && !mutationsToIgnore.includes(mutation.type)
            && !mutation.type.startsWith("clickerModule/");

        console.log(mutation.type);

        const storageObject = {
            postsModule: state.postsModule,
            settingsModule: state.settingsModule,
            firebaseModule: state.firebaseModule,
        };
        const stringifiedStorage = JSON.stringify(storageObject);

        if (!shouldSaveState) {
            const mutationIsStorageChange = [
                "settingsModule/setStorageMethod",
                "firebaseModule/setFirebaseConfig"
            ].includes(mutation.type);
            if (mutationIsStorageChange) {
                console.log("mutationIsStorageChange, saving locally");
                localStorage.setItem(STORAGE_KEY, stringifiedStorage); // we want to store locally that we've changed the storage method, so it'll persist on refreshes
            }
            return;
        }
        console.log("autosaving, mutation is", mutation.type);

        const shouldSaveLocally = state.settingsModule.storageMethod === "local";
        if (shouldSaveLocally) {
            localStorage.setItem(STORAGE_KEY, stringifiedStorage);
        } else {
            const mutationIsStorageChange = [
                "settingsModule/setStorageMethod",
                "firebaseModule/setFirebaseConfig"
            ].includes(mutation.type);
            if (mutationIsStorageChange) {
                console.log("mutationIsStorageChange, saving locally");
                localStorage.setItem(STORAGE_KEY, stringifiedStorage); // we want to store locally that we've changed the storage method, so it'll persist on refreshes
            }

            const firebaseDB = firebaseDbFactory(state.firebaseModule.firebaseConfig);
            firebaseDB.ref(STORAGE_KEY).set(stringifiedStorage);
        }
    }
);

export default store;
