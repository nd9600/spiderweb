import type {
    DataModuleState,
    GraphId,
    LinkId,
    PostId,
    SubgraphId
} from "@/src/@types/StoreTypes";
import {createSubgraph} from "@/src/store/models/Subgraph";
import {writeFirebaseDataModulePatch, type FirebaseUpdatePatch} from "@/src/store/remoteSync";
import {addPostToGraphState} from "./graphs";
import {addMembership, hasMembership, newRecordId, removeMembership} from "./shared";

export function subgraphState(): Pick<DataModuleState, "subgraphs" | "selectedSubgraphIds"> {
    return {
        subgraphs: {},
        selectedSubgraphIds: [],
    };
}

export function getSubgraphGraphId(state: DataModuleState, subgraphId: SubgraphId): Nullable<GraphId> {
    return state.subgraphs[subgraphId]?.graph ?? null;
}

export function addPostToSubgraphState(state: DataModuleState, subgraphId: SubgraphId, postId: PostId): void {
    const subgraph = state.subgraphs[subgraphId];
    if (subgraph == null) {
        return;
    }

    // A post cannot be in a subgraph without also being in that subgraph's parent graph.
    addPostToGraphState(state, subgraph.graph, postId);

    if (!hasMembership(subgraph.nodes, postId)) {
        addMembership(subgraph.nodes, postId);
    }
}

function removePostFromSubgraphState(state: DataModuleState, subgraphId: SubgraphId, postId: PostId): void {
    const subgraph = state.subgraphs[subgraphId];
    if (subgraph == null) {
        return;
    }

    // Removing a post from a subgraph also removes subgraph-local links that depend on that post.
    for (const linkId of Object.keys(subgraph.links) as LinkId[]) {
        const link = state.links[linkId];
        if (link != null && (link.source === postId || link.target === postId)) {
            removeMembership(subgraph.links, linkId);
        }
    }
    removeMembership(subgraph.nodes, postId);
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

export const subgraphActions = {
    setSelectedSubgraphIds(selectedSubgraphIds: SubgraphId[]) {
        this.selectedSubgraphIds = selectedSubgraphIds;
        writeFirebaseDataModulePatch({
            "dataModule/selectedSubgraphIds": selectedSubgraphIds,
        });
    },
    selectAllSubgraphs() {
        if (this.selectedGraphId == null || this.graphs[this.selectedGraphId] == null) {
            this.selectedSubgraphIds = [];
        } else {
            this.selectedSubgraphIds = Object.values(this.subgraphs)
                .filter((subgraph) => subgraph.graph === this.selectedGraphId)
                .map((subgraph) => subgraph.id);
        }
        writeFirebaseDataModulePatch({
            "dataModule/selectedSubgraphIds": this.selectedSubgraphIds,
        });
    },
    toggleSubgraphId(subgraphId: SubgraphId) {
        if (this.selectedSubgraphIds.includes(subgraphId)) {
            this.selectedSubgraphIds = this.selectedSubgraphIds.filter((selectedSubgraphId) => selectedSubgraphId !== subgraphId);
        } else {
            this.selectedSubgraphIds.push(subgraphId);
        }
        writeFirebaseDataModulePatch({
            "dataModule/selectedSubgraphIds": this.selectedSubgraphIds,
        });
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
        this.subgraphs[newSubgraphId] = createSubgraph(newSubgraphId, graphId, newSubgraphName);
        writeFirebaseDataModulePatch({
            [`dataModule/subgraphs/${newSubgraphId}`]: this.subgraphs[newSubgraphId],
        });
    },
    changeSubgraphName({subgraphId, newSubgraphName}: {subgraphId: SubgraphId; newSubgraphName: string}) {
        this.subgraphs[subgraphId].name = newSubgraphName;
        writeFirebaseDataModulePatch({
            [`dataModule/subgraphs/${subgraphId}/name`]: newSubgraphName,
        });
    },
    changeSubgraphColour({subgraphId, colour}: {subgraphId: SubgraphId; colour: string}) {
        this.subgraphs[subgraphId].colour = colour;
        writeFirebaseDataModulePatch({
            [`dataModule/subgraphs/${subgraphId}/colour`]: colour,
        });
    },
    removeSubgraph(subgraphId: SubgraphId) {
        this.selectedSubgraphIds = this.selectedSubgraphIds
            .filter((selectedSubgraphId) => selectedSubgraphId !== subgraphId);

        delete this.subgraphs[subgraphId];
        writeFirebaseDataModulePatch({
            "dataModule/selectedSubgraphIds": this.selectedSubgraphIds,
            [`dataModule/subgraphs/${subgraphId}`]: null,
        });
    },
    addPostToSubgraph({subgraphId, postId}: {subgraphId: SubgraphId; postId: PostId}) {
        const subgraph = this.subgraphs[subgraphId];
        if (subgraph == null) {
            return;
        }

        addPostToSubgraphState(this, subgraphId, postId);
        writeFirebaseDataModulePatch({
            [`dataModule/graphs/${subgraph.graph}/nodes/${postId}`]: true,
            [`dataModule/subgraphs/${subgraphId}/nodes/${postId}`]: true,
        });
    },
    removePostFromSubgraph({subgraphId, postId}: {subgraphId: SubgraphId; postId: PostId}) {
        const subgraph = this.subgraphs[subgraphId];
        if (subgraph == null) {
            return;
        }

        // Build the Firebase patch before local mutation because local mutation deletes the affected link memberships.
        const patch: FirebaseUpdatePatch = {
            [`dataModule/subgraphs/${subgraphId}/nodes/${postId}`]: null,
        };
        for (const linkId of Object.keys(subgraph.links) as LinkId[]) {
            const link = this.links[linkId];
            if (link != null && (link.source === postId || link.target === postId)) {
                patch[`dataModule/subgraphs/${subgraphId}/links/${linkId}`] = null;
            }
        }
        removePostFromSubgraphState(this, subgraphId, postId);
        writeFirebaseDataModulePatch(patch);
    },
} satisfies ThisType<DataModuleState>;

export const subgraphGetters = {
    linkedSubgraphs(store: DataModuleState) {
        return (postId: PostId): SubgraphId[] => {
            const linkedSubgraphs: SubgraphId[] = [];

            for (const subgraph of Object.values(store.subgraphs)) {
                if (hasMembership(subgraph.nodes, postId)) {
                    linkedSubgraphs.push(subgraph.id);
                }
            }

            return linkedSubgraphs;
        };
    },
    subgraphsLinkIsIn(store: DataModuleState) {
        return (linkId: LinkId): SubgraphId[] => {
            const subgraphsLinkIsIn: SubgraphId[] = [];

            for (const subgraph of Object.values(store.subgraphs)) {
                if (hasMembership(subgraph.links, linkId)) {
                    subgraphsLinkIsIn.push(subgraph.id);
                }
            }

            return subgraphsLinkIsIn;
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
};
