import {isInteger} from "@/js/helpers/numberHelpers";

const state = {
    shouldAutosave: true,
    storageMethod: "local", // local | firebase

    canOpenMultiplePosts: true,

    graphHeight: 66,
    postBarHeight: 66,
};

const getters = {
};

const mutations = {
    setState(state, stateFromLocalStorage) {
        state.shouldAutosave = stateFromLocalStorage.shouldAutosave || true;
        state.canOpenMultiplePosts = stateFromLocalStorage.canOpenMultiplePosts || true;
        state.storageMethod = stateFromLocalStorage.storageMethod || "local";
        state.graphHeight = stateFromLocalStorage.graphHeight || 66;
        state.postBarHeight = stateFromLocalStorage.postBarHeight || 66;
    },
    
    setShouldAutosave(state, shouldAutosave) {
        state.shouldAutosave = shouldAutosave;
    },
    setStorageMethod(state, storageMethod) {
        state.storageMethod = storageMethod;
    },

    setCanOpenMultiplePosts(state, canOpenMultiplePosts) {
        state.canOpenMultiplePosts = canOpenMultiplePosts;
    },

    setGraphHeight(state, graphHeight) {
        if(!isInteger(graphHeight)) {
            return;
        }
        state.graphHeight = graphHeight;
    },
    setPostBarHeight(state, postBarHeight) {
        if (!isInteger(postBarHeight)) {
            return;
        }
        state.postBarHeight = postBarHeight;
    }
};

const actions = {
};


export default {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};
