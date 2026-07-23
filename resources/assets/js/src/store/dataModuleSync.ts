import {defineStore} from "pinia";

import type {DataModulePatch} from "./dataModulePatch";
import {toFirebaseUpdatePatch} from "./dataModulePatch";
import {updateFirebaseStorage} from "./firebaseStorage";
import {useFirebaseStore} from "./modules/firebaseModule";
import {useSettingsStore} from "./modules/settingsModule";

interface DataModuleSyncState {
    remoteWriteSuppressionDepth: number;
}

export const useDataModuleSyncStore = defineStore("dataModuleSync", {
    state: (): DataModuleSyncState => ({
        remoteWriteSuppressionDepth: 0,
    }),
    actions: {
        runWithoutRemoteWrites<T>(callback: () => T): T {
            this.remoteWriteSuppressionDepth += 1;
            try {
                return callback();
            } finally {
                this.remoteWriteSuppressionDepth -= 1;
            }
        },
        writePatch(patch: DataModulePatch): void {
            // Remote snapshots and imports mutate Pinia state, but they should not echo straight back to Firebase.
            if (
                patch.length === 0
                || this.remoteWriteSuppressionDepth > 0
                || useSettingsStore().remoteStorageMethod !== "firebase"
            ) {
                return;
            }

            void updateFirebaseStorage(
                useFirebaseStore().firebaseConfig,
                toFirebaseUpdatePatch(patch)
            ).catch((error: unknown) => {
                console.log(error);
            });
        },
    },
});
