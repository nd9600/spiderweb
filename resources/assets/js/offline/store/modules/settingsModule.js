import Vue from "vue";

const state = {
    shouldAutosave: true
};

const getters = {
};

const mutations = {
    setState(state, stateFromLocalStorage) {
        state.shouldAutosave = stateFromLocalStorage.shouldAutosave;
    },
    
    setShouldAutosave(state, shouldAutosave) {
        state.shouldAutosave = shouldAutosave;
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
