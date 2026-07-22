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
import {
    applyDataModulePatch,
    type DataModulePatch,
    type DataModulePatchEntry
} from "@/src/store/dataModulePatch";
import type {Graph} from "@/src/store/models/Graph";
import type {Link} from "@/src/store/models/Link";
import type {Post} from "@/src/store/models/Post";
import type {Subgraph} from "@/src/store/models/Subgraph";
import {useDataModuleSyncStore} from "@/src/store/dataModuleSync";

function commitDataModulePatch(state: DataModuleState, patch: DataModulePatch): DataModulePatch {
    applyDataModulePatch(state, patch);
    useDataModuleSyncStore().writePatch(patch);

    return patch;
}

// Action files use these domain methods so they do not need to know the Firebase path layout.
// The builder still records the same typed patch entries that dataModulePatch.ts applies locally
// and converts to Firebase multi-location updates.
class DataModulePatchBuilder {
    private readonly entries: DataModulePatch = [];
    private readonly state: DataModuleState;

    constructor(state: DataModuleState) {
        this.state = state;
    }

    commit(): DataModulePatch {
        return commitDataModulePatch(this.state, this.entries);
    }

    private add(entry: DataModulePatchEntry): this {
        this.entries.push(entry);
        return this;
    }

    setSelectedPostIds(selectedPostIds: PostId[]): this {
        return this.add({path: ["selectedPostIds"], value: selectedPostIds});
    }

    setSelectedGraphId(selectedGraphId: GraphId | null): this {
        return this.add({path: ["selectedGraphId"], value: selectedGraphId});
    }

    setSelectedSubgraphIds(selectedSubgraphIds: SubgraphId[]): this {
        return this.add({path: ["selectedSubgraphIds"], value: selectedSubgraphIds});
    }

    setZoom(zoom: Zoom): this {
        return this.add({path: ["zoom"], value: zoom});
    }

    setPost(post: Post): this {
        return this.add({path: ["posts", post.id], value: post});
    }

    deletePost(postId: PostId): this {
        return this.add({path: ["posts", postId], value: null});
    }

    setPostTitle(postId: PostId, title: string): this {
        return this.add({path: ["posts", postId, "title"], value: title});
    }

    setPostBody(postId: PostId, body: string): this {
        return this.add({path: ["posts", postId, "body"], value: body});
    }

    setPostUpdatedAt(postId: PostId, updatedAt: string): this {
        return this.add({path: ["posts", postId, "updatedAt"], value: updatedAt});
    }

    setGraph(graph: Graph): this {
        return this.add({path: ["graphs", graph.id], value: graph});
    }

    deleteGraph(graphId: GraphId): this {
        return this.add({path: ["graphs", graphId], value: null});
    }

    setGraphName(graphId: GraphId, name: string): this {
        return this.add({path: ["graphs", graphId, "name"], value: name});
    }

    addPostToGraph(graphId: GraphId, postId: PostId): this {
        return this.add({path: ["graphs", graphId, "nodes", postId], value: true});
    }

    removePostFromGraph(graphId: GraphId, postId: PostId): this {
        return this.add({path: ["graphs", graphId, "nodes", postId], value: null});
    }

    setPostPosition(graphId: GraphId, postId: PostId, position: NodePosition): this {
        return this.add({path: ["graphs", graphId, "nodePositions", postId], value: position});
    }

    deletePostPosition(graphId: GraphId, postId: PostId): this {
        return this.add({path: ["graphs", graphId, "nodePositions", postId], value: null});
    }

    setLink(link: Link): this {
        return this.add({path: ["links", link.id], value: link});
    }

    deleteLink(linkId: LinkId): this {
        return this.add({path: ["links", linkId], value: null});
    }

    setLinkSource(linkId: LinkId, source: PostId): this {
        return this.add({path: ["links", linkId, "source"], value: source});
    }

    setLinkTarget(linkId: LinkId, target: PostId): this {
        return this.add({path: ["links", linkId, "target"], value: target});
    }

    setSubgraph(subgraph: Subgraph): this {
        return this.add({path: ["subgraphs", subgraph.id], value: subgraph});
    }

    deleteSubgraph(subgraphId: SubgraphId): this {
        return this.add({path: ["subgraphs", subgraphId], value: null});
    }

    setSubgraphName(subgraphId: SubgraphId, name: string): this {
        return this.add({path: ["subgraphs", subgraphId, "name"], value: name});
    }

    setSubgraphColour(subgraphId: SubgraphId, colour: Nullable<string>): this {
        return this.add({path: ["subgraphs", subgraphId, "colour"], value: colour});
    }

    addPostToSubgraph(subgraphId: SubgraphId, postId: PostId): this {
        return this.add({path: ["subgraphs", subgraphId, "nodes", postId], value: true});
    }

    removePostFromSubgraph(subgraphId: SubgraphId, postId: PostId): this {
        return this.add({path: ["subgraphs", subgraphId, "nodes", postId], value: null});
    }

    addLinkToSubgraph(subgraphId: SubgraphId, linkId: LinkId): this {
        return this.add({path: ["subgraphs", subgraphId, "links", linkId], value: true});
    }

    removeLinkFromSubgraph(subgraphId: SubgraphId, linkId: LinkId): this {
        return this.add({path: ["subgraphs", subgraphId, "links", linkId], value: null});
    }
}

export function createDataModulePatch(state: DataModuleState): DataModulePatchBuilder {
    return new DataModulePatchBuilder(state);
}
