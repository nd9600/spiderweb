import type {GraphId, LinkId, LinkType, PostId} from "@/src/@types/StoreTypes";

export interface Link {
    id: LinkId;
    graph: GraphId;
    source: PostId;
    target: PostId;
    type: LinkType;
}

export function createLink(
    id: LinkId,
    graph: GraphId,
    source: PostId,
    target: PostId,
    type: LinkType = "reply"
): Link {
    return {
        id,
        graph,
        source,
        target,
        type,
    };
}
