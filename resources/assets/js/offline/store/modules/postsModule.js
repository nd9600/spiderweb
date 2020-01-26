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
        1: {
            id: 1,
            name: "default",
            nodes: [],
            colour: "black"
        }
    },

    selectedPostId: null,
    selectedGraphIds: [1]
};

const getters = {
    graphNames(state) {
        return Object.values(state.graphs).map(graph => graph.name);
    },

    // graph getters
    postsInSelectedGraphs(state) {
        let postIDs = [];
        for (let selectedGraphId of state.selectedGraphIds) {
            postIDs = postIDs.concat(state.graphs[selectedGraphId].nodes);
        }
        const uniquePostIDs = [...new Set(postIDs)];
        return uniquePostIDs.map(id => state.posts[id]);
    },
    linksInSelectedGraphs(state) {
        return Object.values(state.links)
            .filter(link => {
                return state.selectedGraphIds.includes(link.graph);
            });
    },

    // node/link getters
    graphColour: (state) => (id) => state.graphs[id].colour || stringToColour(`${String(id)}salt and pepper are good for hashes`), // if we just hash the id, the colours are almost identical

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
    },

    titleOrBody: (state) => (postId) => {
        const post = state.posts[postId];
        return post.title.length > 0
            ? post.title
            : post.body.substr(0, 20);
    }
};

const mutations = {
    setState(state, stateFromLocalStorage) {
        state.posts = stateFromLocalStorage.posts;
        state.links = stateFromLocalStorage.links;
        state.graphs = stateFromLocalStorage.graphs;
        state.selectedPostId = stateFromLocalStorage.selectedPostId;
        state.selectedGraphIds = stateFromLocalStorage.selectedGraphIds;
    },
    
    setSelectedPostId(state, selectedPostId) {
        state.selectedPostId = selectedPostId;
    },
    setSelectedGraphIds(state, selectedGraphIds) {
        state.selectedGraphIds = selectedGraphIds;
    },

    makeNewGraph(state, newGraphName) {
        if (newGraphName.trim().length === 0) {
            return;
        }

        const existingGraphNames = Object.values(state.graphs).map(graph => graph.name);
        if (existingGraphNames.includes(newGraphName)) {
            alert("You're trying to add a graph that already exists");
            return;
        }

        const existingGraphIds = Object.keys(state.graphs);

        const highestGraphId = existingGraphIds.length === 0
            ? 0
            : (
                Math.max(
                    ...existingGraphIds
                        .map(id => parseInt(id, 10))
                )
            );
        const newGraphId = highestGraphId + 1;

        Vue.set(
            state.graphs,
            newGraphId,
            {
                id: newGraphId,
                name: newGraphName,
                nodes: []
            }
        );
    },
    removeGraph(state, graphId) {
        const newSelectedGraphIds = state.selectedGraphIds
            .filter(selectedGraphId => selectedGraphId !== graphId);
        state.selectedGraphIds = newSelectedGraphIds.length === 0
            ? [1]
            : newSelectedGraphIds;
        Vue.delete(state.graphs, graphId);
    },

    addPostToGraph(state, {graphId, postId}) {
        state.graphs[graphId].nodes.push(postId);
    },
    removePostFromGraph(state, {graphId, postId}) {
        let linksAfterPostRemoval = {};
        for (const link of Object.values(state.links)) {
            const isRemovingPostFromThisGraph = link.graph === parseInt(graphId, 10); // this is a string, like `"2"`, _not_ `2`
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
            state.graphs[graphId],
            "nodes",
            state.graphs[graphId].nodes.filter(id => id !== postId)
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
        Vue.set(state.posts, newPostId, newPost);
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
        for (let [graphId, graph] of Object.entries(state.graphs)) {
            const newGraph = {
                ...graph,
                nodes: graph.nodes.filter(postId => postId !== id)
            };
            Vue.set(state.graphs, graphId, newGraph);
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

        // add source and/or target posts to the graph, if they're not there already
        const postIdsAlreadyInGraph = state.graphs[graph].nodes;
        if (!postIdsAlreadyInGraph.includes(source)) {
            state.graphs[graph].nodes.push(source);
        }
        if (!postIdsAlreadyInGraph.includes(target)) {
            state.graphs[graph].nodes.push(target);
        }

        Vue.set(state.links, newLinkId, {
            id: newLinkId,
            graph,
            source,
            target,
            type
        });
    },
    updateLink(state, link) {
        // add source and/or target posts to the graph, if they're not there already
        const postIdsAlreadyInGraph = state.graphs[link.graph].nodes;
        if (!postIdsAlreadyInGraph.includes(link.source)) {
            state.graphs[link.graph].nodes.push(link.source);
        }
        if (!postIdsAlreadyInGraph.includes(link.target)) {
            state.graphs[link.graph].nodes.push(link.target);
        }

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
