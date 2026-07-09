import type {LinkId, PostId, SubgraphId} from "@/src/@types/StoreTypes";

export interface Subgraph {
    id: SubgraphId;
    name: string;
    nodes: PostId[];
    links: LinkId[];
    colour?: string;
}

export function createSubgraph(
    id: SubgraphId,
    name: string,
    nodes: PostId[] = [],
    links: LinkId[] = [],
    colour?: string
): Subgraph {
    return {
        id,
        name,
        nodes,
        links,
        colour,
    };
}
