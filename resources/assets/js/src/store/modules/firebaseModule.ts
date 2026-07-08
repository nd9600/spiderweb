import {defineStore} from "pinia";

import {
    FirebaseConfig,
} from "@/src/@types/StoreTypes";
import {useRootStore} from "./rootStore";

export interface FirebaseModuleState {
    firebaseConfig: FirebaseConfig;
}

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

const mutations = {
    setState(state: FirebaseModuleState, newState: Partial<FirebaseModuleState>) {
        if (Object.keys(newState).length === 0) {
            return;
        }

        state.firebaseConfig = newState.firebaseConfig || defaultFirebaseConfig;
    },
    setFirebaseConfig(state: FirebaseModuleState, firebaseConfig: FirebaseConfig) {
        state.firebaseConfig = firebaseConfig;
    }
};

const actions = {
    async setFirebaseConfig(store: FirebaseModuleState & {setFirebaseConfigValue(firebaseConfig: FirebaseConfig): void}, firebaseConfig: FirebaseConfig) {
        if (firebaseConfig.apiKey === "") {
            throw new Error("firebase config is wrong, please check it");
        }

        store.setFirebaseConfigValue(firebaseConfig);
        await useRootStore().loadStateFromStorage();
    }
};

export const useFirebaseStore = defineStore("firebaseModule", {
    state: (): FirebaseModuleState => ({
        firebaseConfig: {
            ...defaultFirebaseConfig
        }
    }),
    actions: {
        setState(newState: Partial<FirebaseModuleState>) {
            mutations.setState(this, newState);
        },
        setFirebaseConfigValue(firebaseConfig: FirebaseConfig) {
            mutations.setFirebaseConfig(this, firebaseConfig);
        },
        async setFirebaseConfig(firebaseConfig: FirebaseConfig) {
            await actions.setFirebaseConfig(this, firebaseConfig);
        }
    }
});

export {defaultFirebaseConfig, state, mutations, actions};

export default {
    state,
    getters: {},
    mutations,
    actions,
};
