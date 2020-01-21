import Vue from "vue";

function stringToColour(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        colour += ("00" + value.toString(16)).substr(-2);
    }
    return colour;
}

const state = {
    posts: {},
    links: {},
    
    graphs: {
        "default": {
            name: "default",
            nodes: []
        }
    },

    selectedPostId: null,
    selectedGraphNames: ["default"]
};

const getters = {
    graphNames(state) {
        return Object.keys(state.graphs);
    },

    // graph getters
    postsInSelectedGraphs(state) {
        let postIDs = [];
        for (let selectedGraphName of state.selectedGraphNames) {
            postIDs = postIDs.concat(state.graphs[selectedGraphName].nodes);
        }
        const uniquePostIDs = [...new Set(postIDs)];
        return uniquePostIDs.map(id => state.posts[id]);
    },
    linksInSelectedGraphs(state) {
        return Object.values(state.links)
            .filter(link => state.selectedGraphNames.includes(link.graph));
    },

    // node/link getters
    graphColour: (state) => (name) => state.graphs[name].colour || stringToColour(name),

    // post linking getters
    postIds(state) {
        return Object.keys(state.posts).map(n => parseInt(n, 10));
    },

    unlinkedPosts(state) {
        let linkedPostIDs = [];
        for (let graphObj of Object.values(state.graphs)) {
            linkedPostIDs = linkedPostIDs.concat(graphObj.nodes);
        }
        const uniqueLinkedPostIDs = [...new Set(linkedPostIDs)];
        const postIDs = Object.keys(state.posts)
            .map(n => parseInt(n, 10));

        return postIDs
            .filter(id => !uniqueLinkedPostIDs.includes(id))
            .map(id => state.posts[id]);
    }
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

    makeNewGraph(state, newGraphName) {
        if (newGraphName.trim().length === 0) {
            return;
        }

        const existingGraphNames = Object.keys(state.graphs);
        if (existingGraphNames.includes(newGraphName)) {
            alert("You're trying to add a graph that already exists");
            return;
        }
        Vue.set(
            state.graphs,
            newGraphName,
            {
                name: newGraphName,
                nodes: []
            }
        );
    },
    removeGraph(state, graphName) {
        const newSelectedGraphNames = state.selectedGraphNames
            .filter(graph => graph !== graphName);
        state.selectedGraphNames = (newSelectedGraphNames.length === 0)
            ? ["default"]
            : newSelectedGraphNames;
        Vue.delete(state.graphs, graphName);
    },
    removePostFromGraph(state, {graphName, postId}) {
        let linksAfterPostRemoval = {};
        for (const link of Object.values(state.links)) {
            const isRemovingPostFromThisGraph = link.graph === graphName;
            const postIsSourceOrTarget =
                link.source === postId
                || link.target === postId;
            if (
                isRemovingPostFromThisGraph
                && postIsSourceOrTarget
            ) {
                continue;
            }
            linksAfterPostRemoval[link.id] = link;
        }
        Vue.set(state, "links", linksAfterPostRemoval);
        
        Vue.set(
            state.graphs[graphName],
            "nodes",
            state.graphs[graphName].nodes.filter(id => id !== postId)
        );
    },

    makeNewPost(state, newPost) {
        const existingPostIds = Object.keys(state.posts);

        const highestPostId = existingPostIds.length === 0
            ? 0
            : (
                Math.max(
                    ...existingPostIds
                        .map(id => parseInt(id, 10))
                )
            );
        const newPostId = highestPostId + 1;

        newPost.id = newPostId;
        state.posts[newPostId] = newPost;
    },
    updatePost(state, post) {
        Vue.set(state.posts, post.id, post);
    },
    removePost(state, {id}) {
        if (id === state.selectedPostId) { //todo: change to remove from array when you can select multiple posts
            state.selectedPostId = null;
        }

        // we need to remove any links that would include the deleted post
        let linksAfterPostRemoval = {};
        for (const link of Object.values(state.links)) {
            if (
                link.source === id
                || link.target === id
            ) {
                continue;
            }
            linksAfterPostRemoval[link.id] = link;
        }

        // we also need to remove the individual posts from `graphs[graph].nodes`
        for (let [graphName, graph] of Object.entries(state.graphs)) {
            const newGraph = {
                ...graph,
                nodes: graph.nodes.filter(postId => postId !== id)
            };
            Vue.set(state.graphs, graphName, newGraph);
        }

        Vue.set(state, "links", linksAfterPostRemoval);
        Vue.delete(state.posts, id);
    },

    addLink(state, {source, target, graph, type = "reply"}) {
        const existingLinkIds = Object.keys(state.links);
        const highestLinkId = existingLinkIds.length === 0
            ? 0
            : (
                Math.max(
                    ...existingLinkIds
                        .map(id => parseInt(id, 10))
                )
            );
        const newLinkId = highestLinkId + 1;

        const linkAlreadyExists = Object.values(state.links)
            .filter(
                link => {
                    return (
                        link.graph === graph
                        && link.source === source
                        && link.target === target
                        && link.type === type
                    );
                })
            .length > 0;
        if (linkAlreadyExists) {
            alert("This link already exists");
            return;
        }

        Vue.set(state.links, newLinkId, {
            graph,
            id: newLinkId,
            source,
            target,
            type
        });

        // add source and/or target posts to the graph, if they're not there already
        const postIdsAlreadyInGraph = state.graphs[graph].nodes;
        if (!postIdsAlreadyInGraph.includes(source)) {
            state.graphs[graph].nodes.push(source);
        }
        if (!postIdsAlreadyInGraph.includes(target)) {
            state.graphs[graph].nodes.push(target);
        }
    },
    updateLink(state, link) {
        Vue.set(state.links, link.id, link);
    },
    removeLink(state, {id}) {
        Vue.delete(state.links, id);
    },
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
