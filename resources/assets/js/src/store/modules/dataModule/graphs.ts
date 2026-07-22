import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/components/constants";
import type {
    DataModuleState,
    GraphId,
    NodePosition,
    PostId,
    Zoom
} from "@/src/@types/StoreTypes";
import {createGraph} from "@/src/store/models/Graph";
import {createDataModulePatch} from "./commit";
import {hasMembership, membershipIds, newRecordId} from "./shared";

export default {
    state(): Pick<DataModuleState, "graphs" | "selectedGraphId" | "zoom"> {
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
    },
    getters: {
        postIdsInSelectedSubgraphsSet(store: DataModuleState): Set<PostId> {
            const postIds = new Set<PostId>();

            if (store.selectedSubgraphIds.length > 0) {
                for (const selectedSubgraphId of store.selectedSubgraphIds) {
                    const subgraph = store.subgraphs[selectedSubgraphId];
                    if (subgraph != null) {
                        for (const postId of membershipIds(subgraph.nodes)) {
                            postIds.add(postId);
                        }
                    }
                }
            } else if (store.selectedGraphId != null && store.graphs[store.selectedGraphId] != null) {
                for (const postId of membershipIds(store.graphs[store.selectedGraphId].nodes)) {
                    postIds.add(postId);
                }
            }

            return postIds;
        },
    },
    actions: {
        setSelectedGraphId(selectedGraphId: GraphId) {
            return createDataModulePatch(this)
                .setSelectedGraphId(selectedGraphId)
                .setSelectedSubgraphIds([])
                .commit();
        },
        setZoom(zoom: Zoom) {
            return createDataModulePatch(this)
                .setZoom(zoom)
                .commit();
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
            return createDataModulePatch(this)
                .setGraph(createGraph(newGraphId, newGraphName))
                .commit();
        },
        changeGraphName({graphId, newGraphName}: {graphId: GraphId; newGraphName: string}) {
            return createDataModulePatch(this)
                .setGraphName(graphId, newGraphName)
                .commit();
        },
        removeGraph(graphId: GraphId) {
            const graph = this.graphs[graphId];
            if (graph == null) {
                return;
            }

            const patch = createDataModulePatch(this)
                .deleteGraph(graphId);

            if (this.selectedGraphId === graphId) {
                patch.setSelectedGraphId(null);
            }

            const graphSubgraphIds = Object.values(this.subgraphs)
                .filter((subgraph) => subgraph.graph === graphId)
                .map((subgraph) => subgraph.id);

            const selectedSubgraphIds = this.selectedSubgraphIds
                .filter((selectedSubgraphId) => !graphSubgraphIds.includes(selectedSubgraphId));
            patch.setSelectedSubgraphIds(selectedSubgraphIds);

            for (const subgraphId of graphSubgraphIds) {
                patch.deleteSubgraph(subgraphId);
            }

            for (const link of Object.values(this.links)) {
                if (link.graph === graphId) {
                    patch.deleteLink(link.id);
                }
            }

            return patch.commit();
        },
        addPostToGraph({graphId, postId}: {graphId: GraphId; postId: PostId}) {
            const graph = this.graphs[graphId];
            if (graph == null || hasMembership(graph.nodes, postId)) {
                return;
            }

            return createDataModulePatch(this)
                .addPostToGraph(graphId, postId)
                .commit();
        },
        removePostFromGraph({graphId, postId}: {graphId: GraphId; postId: PostId}) {
            const graph = this.graphs[graphId];
            if (graph == null) {
                return;
            }

            const patch = createDataModulePatch(this)
                .removePostFromGraph(graphId, postId)
                .deletePostPosition(graphId, postId);

            for (const link of Object.values(this.links)) {
                if (link.graph !== graphId || (link.source !== postId && link.target !== postId)) {
                    continue;
                }

                patch.deleteLink(link.id);
                for (const subgraph of Object.values(this.subgraphs)) {
                    if (hasMembership(subgraph.links, link.id)) {
                        patch.removeLinkFromSubgraph(subgraph.id, link.id);
                    }
                }
            }

            for (const subgraph of Object.values(this.subgraphs)) {
                if (subgraph.graph === graphId) {
                    patch.removePostFromSubgraph(subgraph.id, postId);
                }
            }

            return patch.commit();
        },
        setPostPosition({postId, position}: {postId: PostId; position: NodePosition}) {
            if (this.selectedGraphId == null) {
                return;
            }

            return createDataModulePatch(this)
                .setPostPosition(this.selectedGraphId, postId, position)
                .commit();
        },
    } satisfies ThisType<DataModuleState>,
};
