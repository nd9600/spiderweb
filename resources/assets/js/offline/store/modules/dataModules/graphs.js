import Vue from "vue";

const state = {
    graphs: {
        1: {
            id: 1,
            name: "default",
            nodes: [],
            subgraphs: [],
        }
    }
};

const getters = {};

const mutations = {
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
                nodes: [],
                subgraphs: []
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
    }
};

const actions = {};


export default {
    state,
    getters,
    mutations,
    actions,
};
