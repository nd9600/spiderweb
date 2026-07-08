import {defineStore} from "pinia";

import type {RemoteStorageMethod, ShouldTakeDataFrom} from "@/src/@types/StoreTypes";
import {isInteger} from "@/src/helpers/numberHelpers";
import {useRootStore} from "./rootStore";

export interface SettingsModuleState {
    shouldAutosave: boolean;
    remoteStorageMethod: RemoteStorageMethod;
    canOpenMultiplePosts: boolean;
    graphHeight: number;
    postBarHeight: number;
    postWidth: number;
}

interface SetRemoteStorageMethodPayload {
    remoteStorageMethod: RemoteStorageMethod;
    shouldTakeDataFrom: Nullable<ShouldTakeDataFrom>;
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

function scheduleAutosaveIfEnabled(shouldAutosave: boolean): void {
    if (shouldAutosave && typeof localStorage !== "undefined") {
        useRootStore().scheduleAutosave();
    }
}

export const useSettingsStore = defineStore("settingsModule", {
    state: (): SettingsModuleState => defaultSettingsState(),
    actions: {
        setState(newState: Partial<SettingsModuleState>) {
            if (Object.keys(newState).length === 0) {
                return;
            }

            this.shouldAutosave = newState.shouldAutosave ?? true;
            this.canOpenMultiplePosts = newState.canOpenMultiplePosts ?? true;
            this.remoteStorageMethod = newState.remoteStorageMethod || "none";
            this.graphHeight = newState.graphHeight || 66;
            this.postBarHeight = newState.postBarHeight || 66;
            this.postWidth = newState.postWidth || 50;
        },
        setShouldAutosave(shouldAutosave: boolean) {
            this.shouldAutosave = shouldAutosave;
            scheduleAutosaveIfEnabled(this.shouldAutosave);
        },
        async setRemoteStorageMethod({remoteStorageMethod, shouldTakeDataFrom}: SetRemoteStorageMethodPayload) {
            const thereAreDifferentDataSources = remoteStorageMethod !== "none";
            this.remoteStorageMethod = remoteStorageMethod;

            if (thereAreDifferentDataSources) {
                await useRootStore().loadDataFrom(shouldTakeDataFrom);
            }

            await useRootStore().saveStateToLocalStorage();
        },
        setCanOpenMultiplePosts(canOpenMultiplePosts: boolean) {
            this.canOpenMultiplePosts = canOpenMultiplePosts;
            scheduleAutosaveIfEnabled(this.shouldAutosave);
        },
        setGraphHeight(graphHeight: number | string) {
            const parsedGraphHeight = Number(graphHeight);
            if (!isInteger(graphHeight) || parsedGraphHeight > 100 || parsedGraphHeight === this.graphHeight) {
                return;
            }

            this.graphHeight = parsedGraphHeight;
            scheduleAutosaveIfEnabled(this.shouldAutosave);
        },
        setPostBarHeight(postBarHeight: number | string) {
            const parsedPostBarHeight = Number(postBarHeight);
            if (!isInteger(postBarHeight) || parsedPostBarHeight > 100 || parsedPostBarHeight === this.postBarHeight) {
                return;
            }

            this.postBarHeight = parsedPostBarHeight;
            scheduleAutosaveIfEnabled(this.shouldAutosave);
        },
        setPostWidth(postWidth: number | string) {
            const parsedPostWidth = Number(postWidth);
            if (!isInteger(postWidth) || parsedPostWidth > 100 || parsedPostWidth === this.postWidth) {
                return;
            }

            this.postWidth = parsedPostWidth;
            scheduleAutosaveIfEnabled(this.shouldAutosave);
        },
    },
});
