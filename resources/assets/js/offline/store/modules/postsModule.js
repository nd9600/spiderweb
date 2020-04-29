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

    selectedPostIds: [],
    selectedGraphIds: [1]
};

const getters = {
    graphNames(state) {
        return Object.values(state.graphs).map(graph => graph.name);
    },

    // graph getters
    postIdsInSelectedGraphs(state) {
        let postIDs = [];
        for (let selectedGraphId of state.selectedGraphIds) {
            postIDs = postIDs.concat(state.graphs[selectedGraphId].nodes);
        }
        const uniquePostIDs = [...new Set(postIDs)];
        return uniquePostIDs;
    },
    postsInSelectedGraphs(state, getters) {
        return getters.postIdsInSelectedGraphs.map(id => state.posts[id]);
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

    unattachedPosts(state) {
        let attachedPostIDs = [];
        for (let graphObj of Object.values(state.graphs)) {
            attachedPostIDs = attachedPostIDs.concat(graphObj.nodes);
        }
        const uniqueAttachedPostIDs = [...new Set(attachedPostIDs)];
        const postIDs = Object.keys(state.posts)
            .map(n => parseInt(n, 10));

        return postIDs
            .filter(id => !uniqueAttachedPostIDs.includes(id))
            .map(id => state.posts[id]);
    },

    titleOrBody: (state) => (postId) => {
        const MAX_TITLE_LENGTH = 30;

        const post = state.posts[postId];
        const strToReturn = post.title.length > 0
            ? post.title
            : post.body.split("\n")[0]; // we don't want to show text after a newline
        return strToReturn.length > MAX_TITLE_LENGTH
            ? strToReturn.substr(0, MAX_TITLE_LENGTH) + ".."
            : strToReturn;
    },

    neighbourIndex(state, getters) {
        let neighbourIndex = {};
        getters.linksInSelectedGraphs.forEach(function (link) {
            const lowerId = Math.min(link.source, link.target);
            const higherId = Math.max(link.source, link.target);
            neighbourIndex[lowerId + "," + higherId] = 1;
        });
        return neighbourIndex;
    },

    isNeighbour: (state, getters) => (a, b) => {
        const lowerId = Math.min(a.id, b.id);
        const higherId = Math.max(a.id, b.id);
        return typeof getters.neighbourIndex[lowerId + "," + higherId] !== "undefined";
    },

    postIdsThatLinkToPost: (state) => (postId) => {
        let fromPostIds = {};
        let toPostIds = {};

        Object.values(state.links).forEach(function (link) {
            if (link.source === postId) {
                fromPostIds[link.id] = link.target;
            } else if (link.target === postId) {
                toPostIds[link.id] = link.source;
            }
        });

        return {
            from: fromPostIds,
            to: toPostIds,
        };
    },

    graphIdsThatIncludeThisPost: (state) => (postId) => {
        let graphIdsThatIncludeThisPost = [];

        for (let graph of Object.values(state.graphs)) {
            if (graph.nodes.includes(postId)) {
                graphIdsThatIncludeThisPost.push(graph.id);
            }
        }
        return graphIdsThatIncludeThisPost;
    }
};

const mutations = {
    setState(state, newState) {
        if (
            Object.keys(newState).length === 0
            || Object.keys(newState.posts).length === 0
        ) {
            return;
        }

        state.posts = newState.posts;
        state.links = newState.links;
        state.graphs = newState.graphs;
        state.selectedPostIds = newState.selectedPostIds;
        state.selectedGraphIds = newState.selectedGraphIds;
    },

    setSelectedPostIds(state, selectedPostIds) {
        state.selectedPostIds = selectedPostIds;
    },
    selectPostId(state, {id, canOpenMultiplePosts}) {
        if (state.selectedPostIds.includes(id)) { // we want to move it to the front of the list
            state.selectedPostIds.splice(state.selectedPostIds.indexOf(id), 1);
        }
        
        if (canOpenMultiplePosts) {
            state.selectedPostIds.unshift(id);
        } else {
            state.selectedPostIds = [id];
        }
    },
    unselectPostId(state, id) {
        state.selectedPostIds.splice(state.selectedPostIds.indexOf(id), 1);
    },
    togglePostId(state, {id, canOpenMultiplePosts}) {
        if (state.selectedPostIds.includes(id)) {
            state.selectedPostIds.splice(state.selectedPostIds.indexOf(id), 1);
        } else {
            if (canOpenMultiplePosts) {
                state.selectedPostIds.unshift(id);
            } else {
                state.selectedPostIds = [id];
            }
        }
    },

    setSelectedGraphIds(state, selectedGraphIds) {
        state.selectedGraphIds = selectedGraphIds;
    },
    selectGraphId(state, graphId) {
        if (!state.selectedGraphIds.includes(graphId)) {
            state.selectedGraphIds.push(graphId);
        }
    },
    toggleGraphId(state, graphId) {
        if (state.selectedGraphIds.includes(graphId)) {
            state.selectedGraphIds.splice(state.selectedGraphIds.indexOf(graphId), 1);
        } else {
            state.selectedGraphIds.push(graphId);
        }
    },

    makeNewGraph(state, newGraphName) {
        if (newGraphName.trim().length === 0) {
            return;
        }

        const existingGraphNames = Object.values(state.graphs).map(graph => graph.name);
        if (existingGraphNames.includes(newGraphName)) {
            alert("You're trying to add a graph that already exists, choose a different name");
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
    changeGraphName(state, {graphId, newGraphName}) {
        state.graphs[graphId].name = newGraphName;
    },
    removeGraph(state, graphId) {
        const newSelectedGraphIds = state.selectedGraphIds
            .filter(selectedGraphId => selectedGraphId !== parseInt(graphId, 10));
        state.selectedGraphIds = newSelectedGraphIds.length === 0
            ? [1]
            : newSelectedGraphIds;
        Vue.delete(state.graphs, graphId);
    },

    addPostToGraph(state, {graphId, postId}) {
        if (!state.graphs[graphId].nodes.includes(postId)) {
            state.graphs[graphId].nodes.push(postId);
        }
    },
    removePostFromGraph(state, {graphId, postId}) {
        // when we remove a post, we need to remove any links that include it
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

    addPost(state, newPost) {
        Vue.set(state.posts, newPost.id, newPost);
        return newPost;
    },
    updatePost(state, post) {
        Vue.set(state.posts, post.id, post);
    },
    removePost(state, {id}) {
        if (state.selectedPostIds.includes(id)) {
            state.selectedPostIds.splice(state.selectedPostIds.indexOf(id), 1);
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
    changeLinkSource(state, {id, source}) {
        let link = JSON.parse(JSON.stringify(state.links[id]));
        if (
            link.source === source
            || link.target === source
        ) {
            return; // you can't link a post to itself
        }

        const postIdsAlreadyInGraph = state.graphs[link.graph].nodes;
        if (!postIdsAlreadyInGraph.includes(source)) {
            state.graphs[link.graph].nodes.push(source);
        }
        link.source = source;

        Vue.set(state.links, id, link);
    },
    changeLinkTarget(state, {id, target}) {
        let link = JSON.parse(JSON.stringify(state.links[id]));
        if (
            link.source === target
            || link.target === target
        ) {
            return; // you can't link a post to itself
        }

        const postIdsAlreadyInGraph = state.graphs[link.graph].nodes;
        if (!postIdsAlreadyInGraph.includes(target)) {
            state.graphs[link.graph].nodes.push(target);
        }
        link.target = target;

        Vue.set(state.links, id, link);
    },
    removeLink(state, {id}) {
        Vue.delete(state.links, id);
    },
};

const actions = {
    async makeNewPost(context, newPost) {
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
        context.commit("addPost", newPost);
        return newPost;
    },
    async replyToPost(context, {postId, newPost}) {

    }
};


export default {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};
