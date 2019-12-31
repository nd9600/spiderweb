import Vue from "vue";
import Vuex from "vuex";

import postsModule from "./modules/postsModule";

Vue.use(Vuex);

const LOCAL_STORAGE_KEY = "offlineState";

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    modules: {
        postsModule
    },
    actions: {
        saveState(context) {
            const storageObject = {
                postsModule: context.state.postsModule
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storageObject));
        },
        loadState(context) {
            const storageObject = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
            if (storageObject === null) {
                alert("The state hasn't been stored locally");
                return;
            }
            if (storageObject.postsModule) {
                context.commit("postsModule/setState", storageObject.postsModule);
            }
        }
    }
});

export default store;
