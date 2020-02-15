import Vue from "vue";
import Vuex from "vuex";

import settingsModule from "./modules/settingsModule";
import firebaseModule from "./modules/firebaseModule";
import postsModule from "./modules/postsModule";
import firebaseDbFactory from "./firebaseDbFactory";

import debounce from "lodash.debounce";

Vue.use(Vuex);

const STORAGE_KEY = "offlineState";

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    modules: {
        settingsModule,
        firebaseModule,
        postsModule
    },
    state: {
        loadingApp: true
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
        }
    },
    actions: {
        saveStateToLocalStorage(context) {
            const storageObject = context.getters.storageObject;
            const stringifiedStorage = JSON.stringify(storageObject);
            localStorage.setItem(STORAGE_KEY, stringifiedStorage);
        },
        saveStateToStorage(context) {
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
        loadStateFromStorage(context) {
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
                    const firebaseDB = firebaseDbFactory(localStorageObject.firebaseModule.firebaseConfig);
                    firebaseDB.ref(STORAGE_KEY).once("value")
                        .then(
                            (snapshot) => {
                                const firebaseStorageObject = JSON.parse(snapshot.val());
                                console.log(firebaseStorageObject);
                                context.dispatch("importState", firebaseStorageObject);
                            }
                        ).catch((error) => {
                            console.log(error);
                            alert("There was an error loading the state from Firebase, please refresh the page/change your Firebase config in 'settings', and try again");
                        })
                        .finally(() => {
                            context.commit("setLoadingApp", false);
                        });
                    break;
                }
            }
        },

        shouldTakeDataFrom(context, shouldTakeDataFrom) {
            switch (shouldTakeDataFrom) {
                case "local storage": {
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

        importState(context, storageObject) {
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
        importData(context, storageObject) {
            if (storageObject.postsModule) {
                context.commit("postsModule/setState", storageObject.postsModule);
            }
        },
        importSettings(context, {storageObject, shouldTakeDataFrom}) {
            const isStorageMethodChanging = context.state.settingsModule.storageMethod !== storageObject.settingsModule.storageMethod;

            if (storageObject.settingsModule) {
                context.commit("settingsModule/setState", storageObject.settingsModule);
            }
            if (storageObject.firebaseModule) {
                context.commit("firebaseModule/setState", storageObject.firebaseModule);
            }

            if (isStorageMethodChanging) {
                context.dispatch("shouldTakeDataFrom", shouldTakeDataFrom);
            }
        }
    }
});

store.subscribe(
    debounce((mutation, state) => {
        const mutationsToIgnore = [
            "postsModule/setState",
            "settingsModule/setState",
            "firebaseModule/setState",
            "setLoadingApp",
        ];
        const shouldSaveState = state.settingsModule.shouldAutosave
            && !mutationsToIgnore.includes(mutation.type);
        if (shouldSaveState) {
            console.log("autosaving, mutation is", mutation.type);
            const storageObject = {
                postsModule: state.postsModule,
                settingsModule: state.settingsModule,
                firebaseModule: state.firebaseModule,
            };
            const stringifiedStorage = JSON.stringify(storageObject);

            const shouldSaveLocally = state.settingsModule.storageMethod === "local";
            if (shouldSaveLocally) {
                localStorage.setItem(STORAGE_KEY, stringifiedStorage);
            } else {
                const mutationIsStorageChange = [
                    "settingsModule/setStorageMethod",
                    "firebaseModule/setFirebaseConfig"
                ].includes(mutation.type);
                if (mutationIsStorageChange) {
                    localStorage.setItem(STORAGE_KEY, stringifiedStorage); // we want to store locally that we've changed the storage method, so it'll persist on refreshes
                }

                const firebaseDB = firebaseDbFactory(state.firebaseModule.firebaseConfig);
                firebaseDB.ref(STORAGE_KEY).set(stringifiedStorage);
            }
        }
    }, 300)
);

export default store;
