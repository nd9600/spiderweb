import type {ActionContext, ActionTree, GetterTree, Module, MutationTree} from "vuex";

import {isInteger} from "@/src/helpers/numberHelpers";
import {setProperty} from "@/src/helpers/vuexHelpers";
import {
    RootStoreState,
    SettingsModuleState,
    ShouldTakeDataFrom,
    RemoteStorageMethod
} from "@/src/@types/StoreTypes";

interface SetRemoteStorageMethodPayload {
    remoteStorageMethod: RemoteStorageMethod;
    shouldTakeDataFrom: Nullable<ShouldTakeDataFrom>;
}

type SettingsActionContext = ActionContext<SettingsModuleState, RootStoreState>;

const state: SettingsModuleState = {
    shouldAutosave: true,
    remoteStorageMethod: "none",
    canOpenMultiplePosts: true,
    graphHeight: 66,
    postBarHeight: 66,
    postWidth: 50,
};

const getters: GetterTree<SettingsModuleState, RootStoreState> = {
};

const mutations: MutationTree<SettingsModuleState> = {
    setState(state, newState: Partial<SettingsModuleState>) {
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

    setShouldAutosave(state, shouldAutosave: boolean) {
        state.shouldAutosave = shouldAutosave;
    },
    setRemoteStorageMethod(state, remoteStorageMethod: RemoteStorageMethod) {
        setProperty(state, ["remoteStorageMethod"], remoteStorageMethod);
    },

    setCanOpenMultiplePosts(state, canOpenMultiplePosts: boolean) {
        state.canOpenMultiplePosts = canOpenMultiplePosts;
    },

    setGraphHeight(state, graphHeight: number | string) {
        if (!isInteger(graphHeight) || graphHeight > 100) {
            return;
        }
        state.graphHeight = Number(graphHeight);
    },
    setPostBarHeight(state, postBarHeight: number | string) {
        if (!isInteger(postBarHeight) || postBarHeight > 100) {
            return;
        }
        state.postBarHeight = Number(postBarHeight);
    },

    setPostWidth(state, postWidth: number | string) {
        if (!isInteger(postWidth) || postWidth > 100) {
            return;
        }
        state.postWidth = Number(postWidth);
    },
};

const actions: ActionTree<SettingsModuleState, RootStoreState> = {
    async setRemoteStorageMethod(context: SettingsActionContext, {remoteStorageMethod, shouldTakeDataFrom}: SetRemoteStorageMethodPayload) {
        // if you're making the remoteStorageMethod be Firebase, then you can choose to either keep the data that's in Local Storage, or overwrite it with the data that's already in Firebase
        const thereAreDifferentDataSources = remoteStorageMethod !== "none";

        context.commit("setRemoteStorageMethod", remoteStorageMethod);
        if (thereAreDifferentDataSources) {
            await context.dispatch(
                "loadDataFrom",
                shouldTakeDataFrom,
                {
                    root: true
                }
            );
        }

        /*
        if remoteStorageMethod == "firebase" && shouldTakeDataFrom == "firebase", and we autosaved this mutation, this would happen:
        1. remoteStorageMethod set to Firebase
        2. subscriber in index.js runs, autosaving state with remoteStorageMethod == "firebase" but *without* the data loaded from Firebase
        3. `loadDataFrom` action runs, since it's async, and then loads data from Firebase, *BUT* we've just autosaved our data to Firebase
        we're loading the data we've just autosaved, which is exactly what we don't want to happen!

        so we intentionally don't autosave the data, and instead save it manually _after_ `loadDataFrom` finishes
         */
        await context.dispatch(
            "saveStateToLocalStorage",
            null,
            {
                root: true
            }
        );
    }
};

const settingsModule: Module<SettingsModuleState, RootStoreState> = {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};

export default settingsModule;
