import type {
    DataModuleState,
    GraphId,
    LinkId,
    LinkType,
    NodePosition,
    PostId,
    SubgraphId,
    Zoom
} from "@/src/@types/StoreTypes";
import type {Graph} from "@/src/store/models/Graph";
import type {Link} from "@/src/store/models/Link";
import type {Post} from "@/src/store/models/Post";
import type {Subgraph} from "@/src/store/models/Subgraph";

type SelectedPostIdsPatchEntry = {
    path: ["selectedPostIds"];
    value: DataModuleState["selectedPostIds"];
};
type SelectedGraphIdPatchEntry = {
    path: ["selectedGraphId"];
    value: GraphId | null;
};
type SelectedSubgraphIdsPatchEntry = {
    path: ["selectedSubgraphIds"];
    value: DataModuleState["selectedSubgraphIds"];
};
type ZoomPatchEntry = {
    path: ["zoom"];
    value: Zoom;
};
type PostPatchEntry = {
    path: ["posts", PostId];
    value: Nullable<Post>;
};
type PostFieldPatchEntry = {
    path: ["posts", PostId, "title" | "body" | "updatedAt"];
    value: string;
};
type GraphPatchEntry = {
    path: ["graphs", GraphId];
    value: Nullable<Graph>;
};
type GraphNamePatchEntry = {
    path: ["graphs", GraphId, "name"];
    value: string;
};
type GraphNodePatchEntry = {
    path: ["graphs", GraphId, "nodes", PostId];
    value: Nullable<true>;
};
type GraphNodePositionPatchEntry = {
    path: ["graphs", GraphId, "nodePositions", PostId];
    value: Nullable<NodePosition>;
};
type LinkPatchEntry = {
    path: ["links", LinkId];
    value: Nullable<Link>;
};
type LinkFieldPatchEntry = {
    path: ["links", LinkId, "graph" | "source" | "target" | "type"];
    value: GraphId | PostId | LinkType;
};
type SubgraphPatchEntry = {
    path: ["subgraphs", SubgraphId];
    value: Nullable<Subgraph>;
};
type SubgraphNamePatchEntry = {
    path: ["subgraphs", SubgraphId, "name"];
    value: string;
};
type SubgraphColourPatchEntry = {
    path: ["subgraphs", SubgraphId, "colour"];
    value: Nullable<string>;
};
type SubgraphNodePatchEntry = {
    path: ["subgraphs", SubgraphId, "nodes", PostId];
    value: Nullable<true>;
};
type SubgraphLinkPatchEntry = {
    path: ["subgraphs", SubgraphId, "links", LinkId];
    value: Nullable<true>;
};

export type DataModulePatchEntry =
    | SelectedPostIdsPatchEntry
    | SelectedGraphIdPatchEntry
    | SelectedSubgraphIdsPatchEntry
    | ZoomPatchEntry
    | PostPatchEntry
    | PostFieldPatchEntry
    | GraphPatchEntry
    | GraphNamePatchEntry
    | GraphNodePatchEntry
    | GraphNodePositionPatchEntry
    | LinkPatchEntry
    | LinkFieldPatchEntry
    | SubgraphPatchEntry
    | SubgraphNamePatchEntry
    | SubgraphColourPatchEntry
    | SubgraphNodePatchEntry
    | SubgraphLinkPatchEntry;

export type DataModulePatch = DataModulePatchEntry[];
export type FirebaseUpdatePatch = Record<string, unknown>;

function firebasePatchPath(path: DataModulePatchEntry["path"]): string {
    return ["dataModule", ...path].join("/");
}

function applyPostPatch(state: DataModuleState, entry: PostPatchEntry | PostFieldPatchEntry): void {
    const [, postId, field] = entry.path;
    if (field == null) {
        const postEntry = entry as PostPatchEntry;
        if (postEntry.value == null) {
            delete state.posts[postId];
        } else {
            state.posts[postId] = postEntry.value;
        }
        return;
    }

    const post = state.posts[postId];
    if (post != null) {
        post[field] = (entry as PostFieldPatchEntry).value;
    }
}

function applyGraphPatch(
    state: DataModuleState,
    entry: GraphPatchEntry | GraphNamePatchEntry | GraphNodePatchEntry | GraphNodePositionPatchEntry
): void {
    const [, graphId, field, childId] = entry.path;
    if (field == null) {
        const graphEntry = entry as GraphPatchEntry;
        if (graphEntry.value == null) {
            delete state.graphs[graphId];
        } else {
            state.graphs[graphId] = graphEntry.value;
        }
        return;
    }

    const graph = state.graphs[graphId];
    if (graph == null) {
        return;
    }

    switch (field) {
        case "name":
            graph.name = entry.value as string;
            break;
        case "nodes":
            if (entry.value == null) {
                delete graph.nodes[childId as PostId];
            } else {
                graph.nodes[childId as PostId] = true;
            }
            break;
        case "nodePositions":
            if (entry.value == null) {
                delete graph.nodePositions[childId as PostId];
            } else {
                graph.nodePositions[childId as PostId] = entry.value as NodePosition;
            }
            break;
    }
}

function applyLinkPatch(state: DataModuleState, entry: LinkPatchEntry | LinkFieldPatchEntry): void {
    const [, linkId, field] = entry.path;
    if (field == null) {
        const linkEntry = entry as LinkPatchEntry;
        if (linkEntry.value == null) {
            delete state.links[linkId];
        } else {
            state.links[linkId] = linkEntry.value;
        }
        return;
    }

    const link = state.links[linkId];
    if (link != null) {
        link[field] = entry.value as never;
    }
}

function applySubgraphPatch(
    state: DataModuleState,
    entry: SubgraphPatchEntry | SubgraphNamePatchEntry | SubgraphColourPatchEntry | SubgraphNodePatchEntry | SubgraphLinkPatchEntry
): void {
    const [, subgraphId, field, childId] = entry.path;
    if (field == null) {
        const subgraphEntry = entry as SubgraphPatchEntry;
        if (subgraphEntry.value == null) {
            delete state.subgraphs[subgraphId];
        } else {
            state.subgraphs[subgraphId] = subgraphEntry.value;
        }
        return;
    }

    const subgraph = state.subgraphs[subgraphId];
    if (subgraph == null) {
        return;
    }

    switch (field) {
        case "name":
            subgraph.name = entry.value as string;
            break;
        case "colour":
            if (entry.value == null) {
                delete subgraph.colour;
            } else {
                subgraph.colour = entry.value as string;
            }
            break;
        case "nodes":
            if (entry.value == null) {
                delete subgraph.nodes[childId as PostId];
            } else {
                subgraph.nodes[childId as PostId] = true;
            }
            break;
        case "links":
            if (entry.value == null) {
                delete subgraph.links[childId as LinkId];
            } else {
                subgraph.links[childId as LinkId] = true;
            }
            break;
    }
}

export function applyDataModulePatch(state: DataModuleState, patch: DataModulePatch): void {
    for (const entry of patch) {
        switch (entry.path[0]) {
            case "selectedPostIds":
                state.selectedPostIds = (entry as SelectedPostIdsPatchEntry).value;
                break;
            case "selectedGraphId":
                state.selectedGraphId = (entry as SelectedGraphIdPatchEntry).value;
                break;
            case "selectedSubgraphIds":
                state.selectedSubgraphIds = (entry as SelectedSubgraphIdsPatchEntry).value;
                break;
            case "zoom":
                state.zoom = (entry as ZoomPatchEntry).value;
                break;
            case "posts":
                applyPostPatch(state, entry as PostPatchEntry | PostFieldPatchEntry);
                break;
            case "graphs":
                applyGraphPatch(state, entry as GraphPatchEntry | GraphNamePatchEntry | GraphNodePatchEntry | GraphNodePositionPatchEntry);
                break;
            case "links":
                applyLinkPatch(state, entry as LinkPatchEntry | LinkFieldPatchEntry);
                break;
            case "subgraphs":
                applySubgraphPatch(
                    state,
                    entry as SubgraphPatchEntry | SubgraphNamePatchEntry | SubgraphColourPatchEntry | SubgraphNodePatchEntry | SubgraphLinkPatchEntry
                );
                break;
        }
    }
}

export function toFirebaseUpdatePatch(patch: DataModulePatch): FirebaseUpdatePatch {
    const firebasePatch: FirebaseUpdatePatch = {};
    for (const entry of patch) {
        firebasePatch[firebasePatchPath(entry.path)] = entry.value;
    }

    return firebasePatch;
}
