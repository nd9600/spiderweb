import {defineStore} from "pinia";

import type {FirebaseConfig} from "@/src/@types/StoreTypes";
import {useRootStore} from "./rootStore";

export interface FirebaseModuleState {
    firebaseConfig: FirebaseConfig;
}

export const defaultFirebaseConfig: FirebaseConfig = {
    apiKey: "",
    authDomain: "xxx.firebaseapp.com",
    databaseURL: "https://xxx.firebaseio.com",
    projectId: "xxx",
    storageBucket: "xxx.appspot.com",
    messagingSenderId: "123",
    appId: "456",
};

export const useFirebaseStore = defineStore("firebaseModule", {
    state: (): FirebaseModuleState => ({
        firebaseConfig: {
            ...defaultFirebaseConfig,
        },
    }),
    actions: {
        setState(newState: Partial<FirebaseModuleState>) {
            if (Object.keys(newState).length === 0) {
                return;
            }

            this.firebaseConfig = newState.firebaseConfig || defaultFirebaseConfig;
        },
        async setFirebaseConfig(firebaseConfig: FirebaseConfig) {
            if (firebaseConfig.apiKey === "") {
                throw new Error("firebase config is wrong, please check it");
            }

            this.firebaseConfig = firebaseConfig;
            await useRootStore().loadStateFromStorage();
        },
    },
});
