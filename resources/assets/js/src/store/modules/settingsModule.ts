import {defineStore} from "pinia";

import {isInteger} from "@/src/helpers/numberHelpers";
import {
    SettingsModuleState,
    ShouldTakeDataFrom,
    RemoteStorageMethod
} from "@/src/@types/StoreTypes";
import {useRootStore} from "./rootStore";

interface SetRemoteStorageMethodPayload {
    remoteStorageMethod: RemoteStorageMethod;
    shouldTakeDataFrom: Nullable<ShouldTakeDataFrom>;
}

const state: SettingsModuleState = {
    shouldAutosave: true,
    remoteStorageMethod: "none",
    canOpenMultiplePosts: true,
    graphHeight: 66,
    postBarHeight: 66,
    postWidth: 50,
};

const mutations = {
    setState(state: SettingsModuleState, newState: Partial<SettingsModuleState>) {
        if (Object.keys(newState).length === 0) {
            return;
        }

        state.shouldAutosave = newState.shouldAutosave == null
            ? true
            : newState.shouldAutosave;
        state.canOpenMultiplePosts = newState.canOpenMultiplePosts == null
            ? true
            : newState.canOpenMultiplePosts;
        state.remoteStorageMethod = newState.remoteStorageMethod || "none";
        state.graphHeight = newState.graphHeight || 66;
        state.postBarHeight = newState.postBarHeight || 66;
        state.postWidth = newState.postWidth || 50;
    },

    setShouldAutosave(state: SettingsModuleState, shouldAutosave: boolean) {
        state.shouldAutosave = shouldAutosave;
    },
    setRemoteStorageMethod(state: SettingsModuleState, remoteStorageMethod: RemoteStorageMethod) {
        state.remoteStorageMethod = remoteStorageMethod;
    },

    setCanOpenMultiplePosts(state: SettingsModuleState, canOpenMultiplePosts: boolean) {
        state.canOpenMultiplePosts = canOpenMultiplePosts;
    },

    setGraphHeight(state: SettingsModuleState, graphHeight: number | string) {
        const parsedGraphHeight = Number(graphHeight);
        if (!isInteger(graphHeight) || parsedGraphHeight > 100) {
            return;
        }
        state.graphHeight = parsedGraphHeight;
    },
    setPostBarHeight(state: SettingsModuleState, postBarHeight: number | string) {
        const parsedPostBarHeight = Number(postBarHeight);
        if (!isInteger(postBarHeight) || parsedPostBarHeight > 100) {
            return;
        }
        state.postBarHeight = parsedPostBarHeight;
    },

    setPostWidth(state: SettingsModuleState, postWidth: number | string) {
        const parsedPostWidth = Number(postWidth);
        if (!isInteger(postWidth) || parsedPostWidth > 100) {
            return;
        }
        state.postWidth = parsedPostWidth;
    },
};

const actions = {
    async setRemoteStorageMethod(store: SettingsModuleState & {setRemoteStorageMethodValue(remoteStorageMethod: RemoteStorageMethod): void}, {remoteStorageMethod, shouldTakeDataFrom}: SetRemoteStorageMethodPayload) {
        const thereAreDifferentDataSources = remoteStorageMethod !== "none";
        store.setRemoteStorageMethodValue(remoteStorageMethod);

        if (thereAreDifferentDataSources) {
            await useRootStore().loadDataFrom(shouldTakeDataFrom);
        }

        await useRootStore().saveStateToLocalStorage();
    }
};

export const useSettingsStore = defineStore("settingsModule", {
    state: (): SettingsModuleState => ({
        ...state
    }),
    actions: {
        setState(newState: Partial<SettingsModuleState>) {
            mutations.setState(this, newState);
        },
        setShouldAutosave(shouldAutosave: boolean) {
            mutations.setShouldAutosave(this, shouldAutosave);
            if (this.shouldAutosave) {
                useRootStore().scheduleAutosave();
            }
        },
        setRemoteStorageMethodValue(remoteStorageMethod: RemoteStorageMethod) {
            mutations.setRemoteStorageMethod(this, remoteStorageMethod);
        },
        async setRemoteStorageMethod(payload: SetRemoteStorageMethodPayload) {
            await actions.setRemoteStorageMethod(this, payload);
        },
        setCanOpenMultiplePosts(canOpenMultiplePosts: boolean) {
            mutations.setCanOpenMultiplePosts(this, canOpenMultiplePosts);
            if (this.shouldAutosave) {
                useRootStore().scheduleAutosave();
            }
        },
        setGraphHeight(graphHeight: number | string) {
            const oldValue = this.graphHeight;
            mutations.setGraphHeight(this, graphHeight);
            if (this.shouldAutosave && this.graphHeight !== oldValue) {
                useRootStore().scheduleAutosave();
            }
        },
        setPostBarHeight(postBarHeight: number | string) {
            const oldValue = this.postBarHeight;
            mutations.setPostBarHeight(this, postBarHeight);
            if (this.shouldAutosave && this.postBarHeight !== oldValue) {
                useRootStore().scheduleAutosave();
            }
        },
        setPostWidth(postWidth: number | string) {
            const oldValue = this.postWidth;
            mutations.setPostWidth(this, postWidth);
            if (this.shouldAutosave && this.postWidth !== oldValue) {
                useRootStore().scheduleAutosave();
            }
        },
    }
});

export {state, mutations, actions};

export default {
    state,
    getters: {},
    mutations,
    actions,
};
