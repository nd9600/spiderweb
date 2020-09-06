import {GraphId, NodePosition, NodePositionsMap, PostId, SubgraphId} from "@/src/@types/StoreTypes";

export interface GraphSerialised {
    id: GraphId;
    name: string,
    nodes: PostId[];
    nodePositions: NodePositionsMap;
    subgraphs: SubgraphId[];
}

export default class Graph {
    constructor(
        public id: GraphId,
        public name: string,
        public nodes: PostId[],
        public nodePositions: NodePositionsMap,
        public subgraphs: SubgraphId[],
    ) {
    }

    serialise(): GraphSerialised {
        return {
            id: this.id,
            name: this.name,
            nodes: this.nodes,
            nodePositions: this.nodePositions,
            subgraphs: this.subgraphs
        }
    }

    static unserialise(graph: GraphSerialised): Graph {
        return new Graph(String(graph.id), graph.name, graph.nodes.map(String), graph.nodePositions, graph.subgraphs.map(String));
    }
}