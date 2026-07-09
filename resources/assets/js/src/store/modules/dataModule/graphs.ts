import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/components/constants";
import type {
    DataModuleState,
    GraphId,
    NodePosition,
    NodePositionsMap,
    PostId,
    Zoom
} from "@/src/@types/StoreTypes";
import {createGraph, type Graph} from "@/src/store/models/Graph";
import type {Post} from "@/src/store/models/Post";
import type {Subgraph} from "@/src/store/models/Subgraph";
import {nextStringId} from "./shared";

export function graphState(): Pick<DataModuleState, "graphs" | "selectedGraphId" | "zoom"> {
    return {
        graphs: {
            "1": {
                id: "1",
                name: "default",
                nodes: [],
                nodePositions: {},
            },
        },
        selectedGraphId: "1",
        zoom: {
            x: WIDTH / 2,
            y: HEIGHT / 2,
            scale: INITIAL_ZOOM,
        },
    };
}

export function addPostToGraphState(state: DataModuleState, graphId: GraphId, postId: PostId): void {
    const graph = state.graphs[graphId];
    if (graph == null || graph.nodes.includes(postId)) {
        return;
    }

    graph.nodes.push(postId);
}

export function removePostPositionFromGraph(graph: Graph, postId: PostId): void {
    const nodePositions: NodePositionsMap = {};
    for (const [positionPostId, position] of Object.entries(graph.nodePositions)) {
        if (positionPostId !== postId) {
            nodePositions[positionPostId] = position;
        }
    }

    graph.nodePositions = nodePositions;
}

export function getPostIdsInSelectedSubgraphs(state: DataModuleState): PostId[] {
    let postIds: PostId[] = [];

    if (state.selectedSubgraphIds.length > 0) {
        for (const selectedSubgraphId of state.selectedSubgraphIds) {
            postIds = postIds.concat(state.subgraphs[selectedSubgraphId].nodes);
        }
    } else if (state.selectedGraphId != null && state.graphs[state.selectedGraphId] != null) {
        postIds = state.graphs[state.selectedGraphId].nodes;
    }

    return [...new Set(postIds.filter((id): id is PostId => id != null))];
}

function removeLinksFromGraphContainingPost(state: DataModuleState, graphId: GraphId, postId: PostId): void {
    for (const link of Object.values(state.links)) {
        if (link.graph !== graphId || (link.source !== postId && link.target !== postId)) {
            continue;
        }

        for (const subgraph of Object.values(state.subgraphs)) {
            subgraph.links = subgraph.links.filter((id) => id !== link.id);
        }

        delete state.links[link.id];
    }
}

function removePostFromGraphState(state: DataModuleState, graphId: GraphId, postId: PostId): void {
    const graph = state.graphs[graphId];
    if (graph == null) {
        return;
    }

    removeLinksFromGraphContainingPost(state, graphId, postId);

    for (const subgraph of Object.values(state.subgraphs)) {
        if (subgraph.graph === graphId) {
            subgraph.nodes = subgraph.nodes.filter((id) => id !== postId);
        }
    }

    removePostPositionFromGraph(graph, postId);
    graph.nodes = graph.nodes.filter((id) => id !== postId);
}

export const graphActions = {
    setSelectedGraphId(selectedGraphId: GraphId) {
        this.selectedSubgraphIds = [];
        this.selectedGraphId = selectedGraphId;
    },
    setZoom(zoom: Zoom) {
        this.zoom = zoom;
    },
    makeNewGraph(newGraphName: string) {
        if (newGraphName.trim().length === 0) {
            return;
        }

        const existingGraphNames = Object.values(this.graphs).map((graph) => graph.name);
        if (existingGraphNames.includes(newGraphName)) {
            alert("You're trying to add a graph that already exists, choose a different name");
            return;
        }

        const newGraphId = nextStringId(this.graphs);
        this.graphs[newGraphId] = createGraph(newGraphId, newGraphName);
    },
    changeGraphName({graphId, newGraphName}: {graphId: GraphId; newGraphName: string}) {
        this.graphs[graphId].name = newGraphName;
    },
    removeGraph(graphId: GraphId) {
        const graph = this.graphs[graphId];
        if (graph == null) {
            return;
        }

        if (this.selectedGraphId === graphId) {
            this.selectedGraphId = null;
        }

        const graphSubgraphIds = Object.values(this.subgraphs)
            .filter((subgraph) => subgraph.graph === graphId)
            .map((subgraph) => subgraph.id);

        this.selectedSubgraphIds = this.selectedSubgraphIds
            .filter((selectedSubgraphId) => !graphSubgraphIds.includes(selectedSubgraphId));

        for (const subgraphId of graphSubgraphIds) {
            delete this.subgraphs[subgraphId];
        }

        for (const link of Object.values(this.links)) {
            if (link.graph === graphId) {
                delete this.links[link.id];
            }
        }

        delete this.graphs[graphId];
    },
    addPostToGraph({graphId, postId}: {graphId: GraphId; postId: PostId}) {
        addPostToGraphState(this, graphId, postId);
    },
    removePostFromGraph({graphId, postId}: {graphId: GraphId; postId: PostId}) {
        removePostFromGraphState(this, graphId, postId);
    },
    setPostPosition({postId, position}: {postId: PostId; position: NodePosition}) {
        if (this.selectedGraphId == null) {
            return;
        }

        this.graphs[this.selectedGraphId].nodePositions[postId] = position;
    },
} satisfies ThisType<DataModuleState>;

export const graphGetters = {
    subgraphsInSelectedGraph(store: DataModuleState): Subgraph[] {
        if (store.selectedGraphId == null || store.graphs[store.selectedGraphId] == null) {
            return [];
        }

        return Object.values(store.subgraphs)
            .filter((subgraph) => subgraph.graph === store.selectedGraphId);
    },
    postIdsInSelectedSubgraphs(store: DataModuleState): PostId[] {
        return getPostIdsInSelectedSubgraphs(store);
    },
    postsInSelectedSubgraphs(store: DataModuleState): Post[] {
        return getPostIdsInSelectedSubgraphs(store)
            .map((id) => store.posts[id]);
    },
};
