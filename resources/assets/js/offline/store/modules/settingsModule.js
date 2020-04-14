import {isInteger} from "@/js/helpers/numberHelpers";

const state = {
    shouldAutosave: true,
    remoteStorageMethod: null, // null | firebase

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
        state.remoteStorageMethod = newState.remoteStorageMethod || null;
        state.graphAndPostsDirection = newState.graphAndPostsDirection || "vertical";
        state.graphHeight = newState.graphHeight || 66;
        state.postBarHeight = newState.postBarHeight || 66;
        state.postWidth = newState.postWidth || 50;
    },
    
    setShouldAutosave(state, shouldAutosave) {
        state.shouldAutosave = shouldAutosave;
    },
    setRemoteStorageMethod(state, remoteStorageMethod) {
        state.remoteStorageMethod = remoteStorageMethod;
    },

    setCanOpenMultiplePosts(state, canOpenMultiplePosts) {
        state.canOpenMultiplePosts = canOpenMultiplePosts;
    },

    setGraphAndPostsDirection(state, graphAndPostsDirection) {
        state.graphAndPostsDirection = graphAndPostsDirection;
    },

    setGraphHeight(state, graphHeight) {
        if(!isInteger(graphHeight) || graphHeight > 100) {
            return;
        }
        state.graphHeight = graphHeight;
    },
    setPostBarHeight(state, postBarHeight) {
        if (!isInteger(postBarHeight) || postBarHeight > 100) {
            return;
        }
        state.postBarHeight = postBarHeight;
    },

    setPostWidth(state, postWidth) {
        if (!isInteger(postWidth) || postWidth > 100) {
            return;
        }
        state.postWidth = postWidth;
    },
};

const actions = {
    setRemoteStorageMethod(context, {remoteStorageMethod, shouldTakeDataFrom}) {

        // if you're making the remoteStorageMethod be Firebase, then you can choose to either keep the data that's already in Firebase, or overwrite it with the data from Local Storage
        const thereAreDifferentDataSources = remoteStorageMethod !== null;

        context.commit("setRemoteStorageMethod", remoteStorageMethod);
        if (thereAreDifferentDataSources) {
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
