import Vue from "vue";
import Vuex from "vuex";

import settingsModule from "./modules/settingsModule";
import postsModule from "./modules/postsModule";

import debounce from "lodash.debounce";

Vue.use(Vuex);

const LOCAL_STORAGE_KEY = "offlineState";

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    modules: {
        settingsModule,
        postsModule
    },
    getters: {
        storageObject(state) {
            return {
                postsModule: state.postsModule,
                settingsModule: state.settingsModule
            };
        }
    },
    mutations: {
    },
    actions: {
        saveStateLocally(context) {
            const storageObject = context.getters.storageObject;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storageObject));
        },
        loadStateFromLocalStorage(context) {
            const storageObject = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
            if (storageObject === null) {
                return;
            }
            context.dispatch("loadState", storageObject);

        },

        loadState(context, storageObject) {
            if (storageObject.postsModule) {
                context.commit("postsModule/setState", storageObject.postsModule);
            }
            if (storageObject.settingsModule) {
                context.commit("settingsModule/setState", storageObject.settingsModule);
            }
        }
    }
});

store.subscribe(
    debounce((mutation, state) => {
        const mutationsToIgnore = [
            "postsModule/setState",
            "settingsModule/setState",
        ];
        const shouldSaveState = state.settingsModule.shouldAutosave
            && !mutationsToIgnore.includes(mutation.type);
        if (shouldSaveState) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
                postsModule: state.postsModule,
                settingsModule: state.settingsModule
            }));
        }
    }, 300)
);

export default store;
