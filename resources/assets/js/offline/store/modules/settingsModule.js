const state = {
    shouldAutosave: true,
    canOpenMultiplePosts: true,
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
