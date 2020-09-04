import Vue from "vue";
import {DataModuleState, GraphId, LinksMap, NodePosition, NodePositionsMap, PostId} from "@/src/@types/StoreTypes";
import Graph from "@/src/offline/store/classes/Graph";
import {SubgraphSerialised} from "@/src/offline/store/classes/Subgraph";

const state = {
    graphs: {
        1: {
            id: 1,
            name: "default",
            nodes: [],
            nodePositions: {},
            subgraphs: [],
        }
    }
};

const getters = {};

const mutations = {
    makeNewGraph(state: DataModuleState, newGraphName: string) {
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
        const newGraph = new Graph(String(newGraphId), newGraphName, [], {}, []);

        Vue.set(
            state.graphs,
            newGraphId,
            newGraph.serialise()
        );
    },
    changeGraphName(state: DataModuleState, {graphId, newGraphName}: {graphId: GraphId, newGraphName: string}) {
        state.graphs[graphId].name = newGraphName;
    },
    removeGraph(state: DataModuleState, graphId: GraphId) {
        if (state.selectedGraphId === graphId) {
            state.selectedGraphId = null;
        }

        const newSelectedSubgraphIds = state.selectedSubgraphIds
            .filter(selectedSubgraphId => !state.graphs[graphId].subgraphs
                .includes(selectedSubgraphId)
            );

        state.selectedSubgraphIds = newSelectedSubgraphIds.length === 0
            ? []
            : newSelectedSubgraphIds;

        // when we remove a graph, we need to remove any of its subgraphs, and any links in it
        for (const subgraphId of state.graphs[graphId].subgraphs) {
            Vue.delete(state.subgraphs, subgraphId);
        }

        for (const link of Object.values(state.links)) {
            const isRemovingThisLinksGraph = link.graph === graphId;
            if (isRemovingThisLinksGraph) {
                Vue.delete(state.links, link.id);
            }
        }
    },

    addPostToGraph(state: DataModuleState, {graphId, postId}: {graphId: GraphId, postId: PostId}) {
        if (!state.graphs[graphId].nodes.includes(postId)) {
            state.graphs[graphId].nodes.push(postId);
        }
    },
    removePostFromGraph(state: DataModuleState, {graphId, postId}: {graphId: GraphId, postId: PostId}) {
        // when we remove a post from a graph, we need to remove any links that include it
        let linksAfterPostRemoval: LinksMap = {};
        for (const link of Object.values(state.links)) {
            const isRemovingPostFromThisGraph = link.graph === graphId;
            const postIsSourceOrTarget =
                link.source === postId
                || link.target === postId;
            if (
                isRemovingPostFromThisGraph
                && postIsSourceOrTarget
            ) {
                // and remove the link from any subgraphs
                for (const subgraphId of Object.keys(state.subgraphs)) {
                    const indexOfLink = state.subgraphs[subgraphId].links.indexOf(link.id);
                    const alreadyInSubgraph = indexOfLink >= 0;
                    if (alreadyInSubgraph) {
                        state.subgraphs[subgraphId].links.splice(indexOfLink, 1);
                    }
                }
                continue;
            }
            linksAfterPostRemoval[link.id] = link;
        }
        Vue.set(state, "links", linksAfterPostRemoval);

        // and remove it from any subgraphs it's in
        for (let subgraphId of state.graphs[graphId].subgraphs) {
            const subgraph = state.subgraphs[subgraphId];
            const newSubgraph: SubgraphSerialised = {
                ...subgraph,
                nodes: subgraph.nodes.filter(postId => postId !== postId)
            };
            Vue.set(state.subgraphs, subgraphId, newSubgraph);
        }

        // and its positions
        let nodePositions: NodePositionsMap = {};
        for (const [postIdCursor, position] of Object.entries(state.graphs[graphId].nodePositions)) {
            if (postIdCursor !== String(postId)) {
                nodePositions[parseInt(postIdCursor, 10)] = position;
            }
        }

        Vue.set(
            state.graphs[graphId],
            "nodePositions",
            nodePositions
        );

        Vue.set(
            state.graphs[graphId],
            "nodes",
            state.graphs[graphId].nodes.filter(id => id !== postId)
        );
    },
    setPostPosition(state: DataModuleState, {postId, position}: {postId: PostId, position: NodePosition}) {
        Vue.set(state.graphs[state.selectedGraphId!].nodePositions, postId, position);
    }
};

const actions = {};


export default {
    state,
    getters,
    mutations,
    actions,
};
