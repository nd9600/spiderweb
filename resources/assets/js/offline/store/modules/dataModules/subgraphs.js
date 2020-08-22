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
    subgraphs: {
        /*
        1: {
            id: 1,
            name: "default",
            nodes: [],
            links: [],
            colour: "#000000"
        }
        */
    }
};

const getters = {
    subgraphColour: (state) => (subgraphId) => {
        if (typeof subgraphId === "undefined") {
            return "#000000";
        }
        return state.subgraphs[subgraphId] && state.subgraphs[subgraphId].colour || stringToColour(`${String(subgraphId)}salt and pepper are good for hashes`);
    }, // if we just hash the id, the colours are almost identical
};

const mutations = {
    makeNewSubgraph(state, {graphId, newSubgraphName}) {
        if (newSubgraphName.trim().length === 0) {
            return;
        }

        const existingGraphNames = Object.values(state.subgraphs).map(subgraph => subgraph.name);
        if (existingGraphNames.includes(newSubgraphName)) {
            alert("You're trying to make a subgraph that already exists, choose a different name");
            return;
        }

        const existingSubgraphIds = Object.keys(state.subgraphs);

        const highestSubgraphId = existingSubgraphIds.length === 0
            ? 0
            : (
                Math.max(
                    ...existingSubgraphIds
                        .map(id => parseInt(id, 10))
                )
            );
        const newSubgraphId = highestSubgraphId + 1;

        Vue.set(
            state.subgraphs,
            newSubgraphId,
            {
                id: newSubgraphId,
                name: newSubgraphName,
                nodes: [],
                links: []
            }
        );
        state.graphs[graphId].subgraphs.push(newSubgraphId);
    },
    changeSubgraphName(state, {subgraphId, newSubgraphName}) {
        state.subgraphs[subgraphId].name = newSubgraphName;
    },
    changeSubgraphColour(state, {subgraphId, colour}) {
        state.subgraphs[subgraphId].colour = colour;
    },
    removeSubgraph(state, subgraphId) {
        const newSelectedSubgraphIds = state.selectedSubgraphIds
            .filter(selectedSubgraphId => selectedSubgraphId !== parseInt(subgraphId, 10));
        state.selectedSubgraphIds = newSelectedSubgraphIds.length === 0
            ? []
            : newSelectedSubgraphIds;
        state.graphs[state.selectedGraphId].subgraphs.splice(
            state.graphs[state.selectedGraphId].subgraphs.indexOf(subgraphId),
            1
        );
        Vue.delete(state.subgraphs, subgraphId);
    },
    addPostToSubgraph(state, {subgraphId, postId}) {
        // we also need to add it to the graph that contains the subgraph, if it's not there already
        if (!state.graphs[state.selectedGraphId].nodes.includes(postId)) {
            state.graphs[state.selectedGraphId].nodes.push(postId);
        }

        if (!state.subgraphs[subgraphId].nodes.includes(postId)) {
            state.subgraphs[subgraphId].nodes.push(postId);
        }
    },
    removePostFromSubgraph(state, {subgraphId, postId}) {
        // when we remove a post, we need to remove any links that include it
        for (const link of Object.values(state.links)) {
            const isRemovingPostFromThisGraph = link.graph === parseInt(subgraphId, 10); // this is a string, like `"2"`, _not_ `2`
            const postIsSourceOrTarget =
                link.source === postId
                || link.target === postId;
            if (
                isRemovingPostFromThisGraph
                && postIsSourceOrTarget
            ) {
                state.subgraphs[subgraphId].links.splice(state.subgraphs[subgraphId].links.indexOf(link.id), 1);
            }
        }

        state.subgraphs[subgraphId].nodes.splice(state.subgraphs[subgraphId].nodes.indexOf(postId), 1);
    },
    setZoom(state, zoom) {
        state.zoom = zoom;
    }
};

const actions = {};

export default {
    state,
    getters,
    mutations,
    actions,
};
