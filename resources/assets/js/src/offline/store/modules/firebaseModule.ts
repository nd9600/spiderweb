import type {ActionContext, ActionTree, GetterTree, Module, MutationTree} from "vuex";

import {
    FirebaseConfig,
    FirebaseModuleState,
    RootStoreState
} from "@/src/@types/StoreTypes";

type FirebaseActionContext = ActionContext<FirebaseModuleState, RootStoreState>;

const defaultFirebaseConfig: FirebaseConfig = {
    apiKey: "",
    authDomain: "xxx.firebaseapp.com",
    databaseURL: "https://xxx.firebaseio.com",
    projectId: "xxx",
    storageBucket: "xxx.appspot.com",
    messagingSenderId: "123",
    appId: "456"
};

const state: FirebaseModuleState = {
    firebaseConfig: defaultFirebaseConfig
};

const getters: GetterTree<FirebaseModuleState, RootStoreState> = {
};

const mutations: MutationTree<FirebaseModuleState> = {
    setState(state, newState: Partial<FirebaseModuleState>) {
        if (Object.keys(newState).length === 0) {
            return;
        }

        state.firebaseConfig = newState.firebaseConfig || defaultFirebaseConfig;
    },
    setFirebaseConfig(state, firebaseConfig: FirebaseConfig) {
        state.firebaseConfig = firebaseConfig;
    }
};

const actions: ActionTree<FirebaseModuleState, RootStoreState> = {
    async setFirebaseConfig(context: FirebaseActionContext, firebaseConfig: FirebaseConfig) {
        if (firebaseConfig.apiKey === "") {
            throw new Error("firebase config is wrong, please check it");
        }
        context.commit("setFirebaseConfig", firebaseConfig);
        await context.dispatch("loadStateFromStorage", null, {root: true});
    }
};

const firebaseModule: Module<FirebaseModuleState, RootStoreState> = {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};

export default firebaseModule;
