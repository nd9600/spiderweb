import type {
    DataModuleState,
    GraphId,
    LinkId,
    PostId,
    SubgraphId
} from "@/src/@types/StoreTypes";
import {createSubgraph} from "@/src/store/models/Subgraph";
import {addPostToGraphState} from "./graphs";
import {nextStringId} from "./shared";

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

    addPostToGraphState(state, subgraph.graph, postId);

    if (!subgraph.nodes.includes(postId)) {
        subgraph.nodes.push(postId);
    }
}

function removePostFromSubgraphState(state: DataModuleState, subgraphId: SubgraphId, postId: PostId): void {
    const subgraph = state.subgraphs[subgraphId];
    if (subgraph == null) {
        return;
    }

    subgraph.links = subgraph.links.filter((linkId) => {
        const link = state.links[linkId];
        return link == null || (link.source !== postId && link.target !== postId);
    });
    subgraph.nodes = subgraph.nodes.filter((id) => id !== postId);
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
    },
    selectAllSubgraphs() {
        if (this.selectedGraphId == null || this.graphs[this.selectedGraphId] == null) {
            this.selectedSubgraphIds = [];
        } else {
            this.selectedSubgraphIds = Object.values(this.subgraphs)
                .filter((subgraph) => subgraph.graph === this.selectedGraphId)
                .map((subgraph) => subgraph.id);
        }
    },
    toggleSubgraphId(subgraphId: SubgraphId) {
        if (this.selectedSubgraphIds.includes(subgraphId)) {
            this.selectedSubgraphIds = this.selectedSubgraphIds.filter((selectedSubgraphId) => selectedSubgraphId !== subgraphId);
        } else {
            this.selectedSubgraphIds.push(subgraphId);
        }
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

        const newSubgraphId = nextStringId(this.subgraphs);
        this.subgraphs[newSubgraphId] = createSubgraph(newSubgraphId, graphId, newSubgraphName);
    },
    changeSubgraphName({subgraphId, newSubgraphName}: {subgraphId: SubgraphId; newSubgraphName: string}) {
        this.subgraphs[subgraphId].name = newSubgraphName;
    },
    changeSubgraphColour({subgraphId, colour}: {subgraphId: SubgraphId; colour: string}) {
        this.subgraphs[subgraphId].colour = colour;
    },
    removeSubgraph(subgraphId: SubgraphId) {
        this.selectedSubgraphIds = this.selectedSubgraphIds
            .filter((selectedSubgraphId) => selectedSubgraphId !== subgraphId);

        delete this.subgraphs[subgraphId];
    },
    addPostToSubgraph({subgraphId, postId}: {subgraphId: SubgraphId; postId: PostId}) {
        addPostToSubgraphState(this, subgraphId, postId);
    },
    removePostFromSubgraph({subgraphId, postId}: {subgraphId: SubgraphId; postId: PostId}) {
        removePostFromSubgraphState(this, subgraphId, postId);
    },
} satisfies ThisType<DataModuleState>;

export const subgraphGetters = {
    linkedSubgraphs(store: DataModuleState) {
        return (postId: PostId): SubgraphId[] => {
            const linkedSubgraphs: SubgraphId[] = [];

            for (const subgraph of Object.values(store.subgraphs)) {
                if (subgraph.nodes.includes(postId)) {
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
                if (subgraph.links.includes(linkId)) {
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
