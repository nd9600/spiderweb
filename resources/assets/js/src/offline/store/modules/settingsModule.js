import {isInteger} from "@/src/helpers/numberHelpers";
import {setProperty} from "@/src/helpers/vuexHelpers";

const state = {
    shouldAutosave: true,
    remoteStorageMethod: "none", // none | firebase

    canOpenMultiplePosts: true,

    graphHeight: 66,
    postBarHeight: 66,

    postWidth: 50,
};

const getters = {
};

const mutations = {
    setState(state, newState) {
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
    
    setShouldAutosave(state, shouldAutosave) {
        state.shouldAutosave = shouldAutosave;
    },
    setRemoteStorageMethod(state, remoteStorageMethod) {
        setProperty(state, ["remoteStorageMethod"], remoteStorageMethod);
    },

    setCanOpenMultiplePosts(state, canOpenMultiplePosts) {
        state.canOpenMultiplePosts = canOpenMultiplePosts;
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
    async setRemoteStorageMethod(context, {remoteStorageMethod, shouldTakeDataFrom}) {
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


export default {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};
