import Vue from "vue";
import Vuex from "vuex";

import postsModule from "./modules/postsModule";

Vue.use(Vuex);

const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== "production",
    modules: {
        postsModule
    }
});

export default store;