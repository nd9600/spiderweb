import {defineStore} from "pinia";

import {
    defaultFirebaseConfig,
    firebaseModuleStateSchema,
    type FirebaseConfig,
    type FirebaseModuleState
} from "@/src/store/models/Firebase";
import {useRootStore} from "./rootStore";

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

            this.firebaseConfig = firebaseModuleStateSchema.parse(newState).firebaseConfig;
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
