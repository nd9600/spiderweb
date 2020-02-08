import {isInteger} from "@/js/helpers/numberHelpers";

const state = {
    shouldAutosave: true,
    canOpenMultiplePosts: true,

    graphHeight: 66,
    postBarHeight: 66,
};

const getters = {
};

const mutations = {
    setState(state, stateFromLocalStorage) {
        state.shouldAutosave = stateFromLocalStorage.shouldAutosave;
        state.canOpenMultiplePosts = stateFromLocalStorage.canOpenMultiplePosts;
    },
    
    setShouldAutosave(state, shouldAutosave) {
        state.shouldAutosave = shouldAutosave;
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
