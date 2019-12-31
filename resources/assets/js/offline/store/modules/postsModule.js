import moment from "moment";

const state = {
    posts: {
    },
    links: [
    ],
    
    graphs: {
    },

    selectedPostId: null,
    selectedGraphNames: []
};

const getters = {
    newPostId(state, getters, rootState) {
        const highestPostId = Math.max(Object.keys(state.posts));
        return highestPostId + 1;
    },
    graphNames(state) {
        return Object.keys(state.graphs);
    },
    
    postsInSelectedGraph(state) {
        let nodes = [];
        for (let selectedGraphName of state.selectedGraphNames) {
            nodes = nodes.concat(state.graphs[selectedGraphName].nodes);
        }
        const uniqueNodes = [...new Set(nodes)];
        return uniqueNodes.map(id => state.posts[id]);
    },
    linksInSelectedGraph(state) {
        return state.links
            .filter(link => state.selectedGraphNames.includes(link.graph));
    },
};

const mutations = {
    setState(state, stateFromLocalStorage) {
        state.posts = stateFromLocalStorage.posts;
        state.links = stateFromLocalStorage.links;
        state.graphs = stateFromLocalStorage.graphs;
        state.selectedPostId = stateFromLocalStorage.selectedPostId;
        state.selectedGraphNames = stateFromLocalStorage.selectedGraphNames;
    },
    
    setSelectedPostId(state, selectedPostId) {
        state.selectedPostId = selectedPostId;
    },
    setSelectedGraphNames(state, selectedGraphNames) {
        state.selectedGraphNames = selectedGraphNames;
    },

    makeNewPost(state, newPost) {
        const highestPostId = Math.max(
            ...Object.keys(state.posts)
                .map(id => parseInt(id, 10))
        );
        const newPostId = highestPostId + 1;

        newPost.id = newPostId;
        state.posts[newPostId] = newPost;
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
