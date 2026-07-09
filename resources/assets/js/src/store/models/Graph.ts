import type {GraphId, NodePositionsMap, PostId, SubgraphId} from "@/src/@types/StoreTypes";

export interface Graph {
    id: GraphId;
    name: string;
    nodes: PostId[];
    nodePositions: NodePositionsMap;
    subgraphs: SubgraphId[];
}

export function createGraph(
    id: GraphId,
    name: string,
    nodes: PostId[] = [],
    nodePositions: NodePositionsMap = {},
    subgraphs: SubgraphId[] = []
): Graph {
    return {
        id,
        name,
        nodes,
        nodePositions,
        subgraphs,
    };
}
