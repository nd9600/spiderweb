import {isInteger} from "@/js/helpers/numberHelpers";

const state = {
    shouldAutosave: true,
    storageMethod: "local", // local | firebase

    canOpenMultiplePosts: true,

    graphAndPostsDirection: "vertical",

    graphHeight: 66,
    postBarHeight: 66,

    postWidth: 50,
};

const getters = {
};

const mutations = {
    setState(state, newState) {
        state.shouldAutosave = newState.shouldAutosave || true;
        state.canOpenMultiplePosts = newState.canOpenMultiplePosts || true;
        state.storageMethod = newState.storageMethod || "local";
        state.graphAndPostsDirection = newState.graphAndPostsDirection || "vertical";
        state.graphHeight = newState.graphHeight || 66;
        state.postBarHeight = newState.postBarHeight || 66;
        state.postWidth = newState.postWidth || 50;
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

    setGraphAndPostsDirection(state, graphAndPostsDirection) {
        state.graphAndPostsDirection = graphAndPostsDirection;
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
    },

    setPostWidth(state, postWidth) {
        if (!isInteger(postWidth)) {
            return;
        }
        state.postWidth = postWidth;
    },
};

const actions = {
    setStorageMethod(context, {storageMethod, shouldTakeDataFrom}) {
        const isStorageMethodChanging = context.state.storageMethod !== storageMethod;

        context.commit("setStorageMethod", storageMethod);
        if (isStorageMethodChanging) {
            context.dispatch(
                "loadDataFrom",
                shouldTakeDataFrom,
                {
                    root: true
                }
            );
        }
    }
};


export default {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};
