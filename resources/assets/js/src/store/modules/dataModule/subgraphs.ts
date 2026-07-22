import type {
    DataModuleState,
    GraphId,
    LinkId,
    PostId,
    SubgraphId
} from "@/src/@types/StoreTypes";
import {createSubgraph, type Subgraph} from "@/src/store/models/Subgraph";
import {createDataModulePatch} from "./commit";
import {membershipIds, newRecordId} from "./shared";

export type SubgraphIdsByPostId = Partial<Record<PostId, SubgraphId[]>>;
export type SubgraphIdsByLinkId = Partial<Record<LinkId, SubgraphId[]>>;
export type SubgraphsByGraphId = Partial<Record<GraphId, Subgraph[]>>;
export interface SubgraphIndexes {
    subgraphsByGraphId: SubgraphsByGraphId;
    subgraphIdsByPostId: SubgraphIdsByPostId;
    subgraphIdsByLinkId: SubgraphIdsByLinkId;
}

function stringToColour(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    let colour = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        colour += ("00" + value.toString(16)).slice(-2);
    }
    return colour;
}

export default {
    state(): Pick<DataModuleState, "subgraphs" | "selectedSubgraphIds"> {
        return {
            subgraphs: {},
            selectedSubgraphIds: [],
        };
    },
    getters: {
        subgraphIndexes(store: DataModuleState): SubgraphIndexes {
            const subgraphsByGraphId: SubgraphsByGraphId = {};
            const subgraphIdsByPostId: SubgraphIdsByPostId = {};
            const subgraphIdsByLinkId: SubgraphIdsByLinkId = {};

            for (const subgraph of Object.values(store.subgraphs)) {
                (subgraphsByGraphId[subgraph.graph] ??= []).push(subgraph);

                for (const postId of membershipIds(subgraph.nodes)) {
                    (subgraphIdsByPostId[postId] ??= []).push(subgraph.id);
                }

                for (const linkId of membershipIds(subgraph.links)) {
                    (subgraphIdsByLinkId[linkId] ??= []).push(subgraph.id);
                }
            }

            return {
                subgraphsByGraphId,
                subgraphIdsByPostId,
                subgraphIdsByLinkId,
            };
        },
        subgraphColour(store: DataModuleState) {
            return (subgraphId: Nullable<SubgraphId>): string => {
                if (subgraphId == null) {
                    return "#000000";
                }

                return store.subgraphs[subgraphId]?.colour || stringToColour(`${String(subgraphId)}salt and pepper are good for hashes`);
            };
        },
    },
    actions: {
        setSelectedSubgraphIds(selectedSubgraphIds: SubgraphId[]) {
            return createDataModulePatch(this)
                .setSelectedSubgraphIds(selectedSubgraphIds)
                .commit();
        },
        selectAllSubgraphs() {
            let selectedSubgraphIds: SubgraphId[];
            if (this.selectedGraphId == null || this.graphs[this.selectedGraphId] == null) {
                selectedSubgraphIds = [];
            } else {
                selectedSubgraphIds = Object.values(this.subgraphs)
                    .filter((subgraph) => subgraph.graph === this.selectedGraphId)
                    .map((subgraph) => subgraph.id);
            }
            return createDataModulePatch(this)
                .setSelectedSubgraphIds(selectedSubgraphIds)
                .commit();
        },
        toggleSubgraphId(subgraphId: SubgraphId) {
            let selectedSubgraphIds: SubgraphId[];
            if (this.selectedSubgraphIds.includes(subgraphId)) {
                selectedSubgraphIds = this.selectedSubgraphIds.filter((selectedSubgraphId) => selectedSubgraphId !== subgraphId);
            } else {
                selectedSubgraphIds = [...this.selectedSubgraphIds, subgraphId];
            }
            return createDataModulePatch(this)
                .setSelectedSubgraphIds(selectedSubgraphIds)
                .commit();
        },
        makeNewSubgraph({graphId, newSubgraphName}: {graphId: GraphId; newSubgraphName: string}) {
            if (newSubgraphName.trim().length === 0) {
                return;
            }

            const existingSubgraphNames = Object.values(this.subgraphs).map((subgraph) => subgraph.name);
            if (existingSubgraphNames.includes(newSubgraphName)) {
                alert("You're trying to make a subgraph that already exists, choose a different name");
                return;
            }

            const newSubgraphId = newRecordId();
            return createDataModulePatch(this)
                .setSubgraph(createSubgraph(newSubgraphId, graphId, newSubgraphName))
                .commit();
        },
        changeSubgraphName({subgraphId, newSubgraphName}: {subgraphId: SubgraphId; newSubgraphName: string}) {
            return createDataModulePatch(this)
                .setSubgraphName(subgraphId, newSubgraphName)
                .commit();
        },
        changeSubgraphColour({subgraphId, colour}: {subgraphId: SubgraphId; colour: string}) {
            return createDataModulePatch(this)
                .setSubgraphColour(subgraphId, colour)
                .commit();
        },
        removeSubgraph(subgraphId: SubgraphId) {
            return createDataModulePatch(this)
                .setSelectedSubgraphIds(this.selectedSubgraphIds.filter((selectedSubgraphId) => selectedSubgraphId !== subgraphId))
                .deleteSubgraph(subgraphId)
                .commit();
        },
        addPostToSubgraph({subgraphId, postId}: {subgraphId: SubgraphId; postId: PostId}) {
            const subgraph = this.subgraphs[subgraphId];
            if (subgraph == null) {
                return;
            }

            return createDataModulePatch(this)
                .addPostToGraph(subgraph.graph, postId)
                .addPostToSubgraph(subgraphId, postId)
                .commit();
        },
        removePostFromSubgraph({subgraphId, postId}: {subgraphId: SubgraphId; postId: PostId}) {
            const subgraph = this.subgraphs[subgraphId];
            if (subgraph == null) {
                return;
            }

            const patch = createDataModulePatch(this)
                .removePostFromSubgraph(subgraphId, postId);
            for (const linkId of Object.keys(subgraph.links) as LinkId[]) {
                const link = this.links[linkId];
                if (link != null && (link.source === postId || link.target === postId)) {
                    patch.removeLinkFromSubgraph(subgraphId, linkId);
                }
            }

            return patch.commit();
        },
    } satisfies ThisType<DataModuleState>,
};
