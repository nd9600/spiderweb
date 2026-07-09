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
import {writeFirebaseDataModulePatch, type FirebaseUpdatePatch} from "@/src/store/remoteSync";
import {addMembership, hasMembership, membershipIds, newRecordId, removeMembership} from "./shared";

export function graphState(): Pick<DataModuleState, "graphs" | "selectedGraphId" | "zoom"> {
    return {
        graphs: {
            "1": {
                id: "1",
                name: "default",
                nodes: {},
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
    if (graph == null || hasMembership(graph.nodes, postId)) {
        return;
    }

    addMembership(graph.nodes, postId);
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
            const subgraph = state.subgraphs[selectedSubgraphId];
            if (subgraph != null) {
                postIds = postIds.concat(membershipIds(subgraph.nodes));
            }
        }
    } else if (state.selectedGraphId != null && state.graphs[state.selectedGraphId] != null) {
        postIds = membershipIds(state.graphs[state.selectedGraphId].nodes);
    }

    return [...new Set(postIds.filter((id): id is PostId => id != null))];
}

function removeLinksFromGraphContainingPost(state: DataModuleState, graphId: GraphId, postId: PostId): void {
    // A graph cannot keep links whose endpoint post has been removed from that graph.
    for (const link of Object.values(state.links)) {
        if (link.graph !== graphId || (link.source !== postId && link.target !== postId)) {
            continue;
        }

        for (const subgraph of Object.values(state.subgraphs)) {
            removeMembership(subgraph.links, link.id);
        }

        delete state.links[link.id];
    }
}

function removePostFromGraphState(state: DataModuleState, graphId: GraphId, postId: PostId): void {
    const graph = state.graphs[graphId];
    if (graph == null) {
        return;
    }

    // Removing a post from a graph also removes all graph-scoped state that refers to that post.
    removeLinksFromGraphContainingPost(state, graphId, postId);

    for (const subgraph of Object.values(state.subgraphs)) {
        if (subgraph.graph === graphId) {
            removeMembership(subgraph.nodes, postId);
        }
    }

    removePostPositionFromGraph(graph, postId);
    removeMembership(graph.nodes, postId);
}

export const graphActions = {
    setSelectedGraphId(selectedGraphId: GraphId) {
        this.selectedSubgraphIds = [];
        this.selectedGraphId = selectedGraphId;
        writeFirebaseDataModulePatch({
            "dataModule/selectedGraphId": selectedGraphId,
            "dataModule/selectedSubgraphIds": [],
        });
    },
    setZoom(zoom: Zoom) {
        this.zoom = zoom;
        writeFirebaseDataModulePatch({
            "dataModule/zoom": zoom,
        });
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

        const newGraphId = newRecordId();
        this.graphs[newGraphId] = createGraph(newGraphId, newGraphName);
        writeFirebaseDataModulePatch({
            [`dataModule/graphs/${newGraphId}`]: this.graphs[newGraphId],
        });
    },
    changeGraphName({graphId, newGraphName}: {graphId: GraphId; newGraphName: string}) {
        this.graphs[graphId].name = newGraphName;
        writeFirebaseDataModulePatch({
            [`dataModule/graphs/${graphId}/name`]: newGraphName,
        });
    },
    removeGraph(graphId: GraphId) {
        const graph = this.graphs[graphId];
        if (graph == null) {
            return;
        }

        // Keep the local cascade and Firebase multi-path patch in lockstep.
        const patch: FirebaseUpdatePatch = {
            [`dataModule/graphs/${graphId}`]: null,
        };

        if (this.selectedGraphId === graphId) {
            this.selectedGraphId = null;
            patch["dataModule/selectedGraphId"] = null;
        }

        const graphSubgraphIds = Object.values(this.subgraphs)
            .filter((subgraph) => subgraph.graph === graphId)
            .map((subgraph) => subgraph.id);

        this.selectedSubgraphIds = this.selectedSubgraphIds
            .filter((selectedSubgraphId) => !graphSubgraphIds.includes(selectedSubgraphId));
        patch["dataModule/selectedSubgraphIds"] = this.selectedSubgraphIds;

        for (const subgraphId of graphSubgraphIds) {
            delete this.subgraphs[subgraphId];
            patch[`dataModule/subgraphs/${subgraphId}`] = null;
        }

        for (const link of Object.values(this.links)) {
            if (link.graph === graphId) {
                delete this.links[link.id];
                patch[`dataModule/links/${link.id}`] = null;
            }
        }

        delete this.graphs[graphId];
        writeFirebaseDataModulePatch(patch);
    },
    addPostToGraph({graphId, postId}: {graphId: GraphId; postId: PostId}) {
        const graph = this.graphs[graphId];
        if (graph == null || hasMembership(graph.nodes, postId)) {
            return;
        }

        addPostToGraphState(this, graphId, postId);
        writeFirebaseDataModulePatch({
            [`dataModule/graphs/${graphId}/nodes/${postId}`]: true,
        });
    },
    removePostFromGraph({graphId, postId}: {graphId: GraphId; postId: PostId}) {
        const graph = this.graphs[graphId];
        if (graph == null) {
            return;
        }

        // Build the Firebase cascade before mutating local state, while the affected links/subgraphs are still easy to find.
        const patch: FirebaseUpdatePatch = {
            [`dataModule/graphs/${graphId}/nodes/${postId}`]: null,
            [`dataModule/graphs/${graphId}/nodePositions/${postId}`]: null,
        };

        for (const link of Object.values(this.links)) {
            if (link.graph !== graphId || (link.source !== postId && link.target !== postId)) {
                continue;
            }

            patch[`dataModule/links/${link.id}`] = null;
            for (const subgraph of Object.values(this.subgraphs)) {
                if (hasMembership(subgraph.links, link.id)) {
                    patch[`dataModule/subgraphs/${subgraph.id}/links/${link.id}`] = null;
                }
            }
        }

        for (const subgraph of Object.values(this.subgraphs)) {
            if (subgraph.graph === graphId) {
                patch[`dataModule/subgraphs/${subgraph.id}/nodes/${postId}`] = null;
            }
        }

        removePostFromGraphState(this, graphId, postId);
        writeFirebaseDataModulePatch(patch);
    },
    setPostPosition({postId, position}: {postId: PostId; position: NodePosition}) {
        if (this.selectedGraphId == null) {
            return;
        }

        this.graphs[this.selectedGraphId].nodePositions[postId] = position;
        writeFirebaseDataModulePatch({
            [`dataModule/graphs/${this.selectedGraphId}/nodePositions/${postId}`]: position,
        });
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
