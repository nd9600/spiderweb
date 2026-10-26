import {defineStore} from "pinia";

import type {FirebaseConfig, RemoteStorageMethod, ShouldTakeDataFrom} from "@/src/@types/StoreTypes";
import {isInteger} from "@/src/helpers/numberHelpers";
import {settingsModuleStateSchema, type SettingsModuleState} from "@/src/store/models/Settings";
import {runWithoutAutosave, useRootStore} from "./rootStore";
import {useFirebaseStore} from "./firebaseModule";

interface SetRemoteStorageMethodPayload {
    remoteStorageMethod: RemoteStorageMethod;
    shouldTakeDataFrom: Nullable<ShouldTakeDataFrom>;
    firebaseConfig?: FirebaseConfig;
}

function defaultSettingsState(): SettingsModuleState {
    return {
        shouldAutosave: true,
        remoteStorageMethod: "none",
        canOpenMultiplePosts: true,
        graphHeight: 66,
        postBarHeight: 66,
        postWidth: 50,
    };
}

export const useSettingsStore = defineStore("settingsModule", {
    state: (): SettingsModuleState => defaultSettingsState(),
    actions: {
        setState(newState: Partial<SettingsModuleState>) {
            if (Object.keys(newState).length === 0) {
                return;
            }

            const settings = settingsModuleStateSchema.parse(newState);
            this.shouldAutosave = settings.shouldAutosave;
            this.canOpenMultiplePosts = settings.canOpenMultiplePosts;
            this.remoteStorageMethod = settings.remoteStorageMethod;
            this.graphHeight = settings.graphHeight;
            this.postBarHeight = settings.postBarHeight;
            this.postWidth = settings.postWidth;
        },
        setShouldAutosave(shouldAutosave: boolean) {
            this.shouldAutosave = shouldAutosave;
        },
        async setRemoteStorageMethod({remoteStorageMethod, shouldTakeDataFrom, firebaseConfig}: SetRemoteStorageMethodPayload) {
            const previousStorageMethod = this.remoteStorageMethod;
            const firebaseStore = useFirebaseStore();
            const previousFirebaseConfig = firebaseStore.firebaseConfig;
            const thereAreDifferentDataSources = remoteStorageMethod !== "none";
            runWithoutAutosave(() => {
                if (firebaseConfig != null) {
                    firebaseStore.setFirebaseConfig(firebaseConfig);
                }
                this.remoteStorageMethod = remoteStorageMethod;
            });

            try {
                if (thereAreDifferentDataSources) {
                    await useRootStore().loadDataFrom(shouldTakeDataFrom);
                }
            } catch (error) {
                runWithoutAutosave(() => {
                    this.remoteStorageMethod = previousStorageMethod;
                    firebaseStore.firebaseConfig = previousFirebaseConfig;
                });
                useRootStore().startFirebaseSync();
                throw error;
            }

            await useRootStore().saveStateToStorage();
        },
        setCanOpenMultiplePosts(canOpenMultiplePosts: boolean) {
            this.canOpenMultiplePosts = canOpenMultiplePosts;
        },
        setGraphHeight(graphHeight: number | string) {
            const parsedGraphHeight = Number(graphHeight);
            if (!isInteger(graphHeight) || parsedGraphHeight > 100 || parsedGraphHeight === this.graphHeight) {
                return;
            }

            this.graphHeight = parsedGraphHeight;
        },
        setPostBarHeight(postBarHeight: number | string) {
            const parsedPostBarHeight = Number(postBarHeight);
            if (!isInteger(postBarHeight) || parsedPostBarHeight > 100 || parsedPostBarHeight === this.postBarHeight) {
                return;
            }

            this.postBarHeight = parsedPostBarHeight;
        },
        setPostWidth(postWidth: number | string) {
            const parsedPostWidth = Number(postWidth);
            if (!isInteger(postWidth) || parsedPostWidth > 100 || parsedPostWidth === this.postWidth) {
                return;
            }

            this.postWidth = parsedPostWidth;
        },
    },
});
