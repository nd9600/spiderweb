import {GraphId, NodePosition, PostId, SubgraphId} from "@/src/@types/StoreTypes";

export interface GraphSerialised {
    id: GraphId;
    name: string,
    nodes: PostId[];
    nodePositions: Record<PostId, NodePosition>;
    subgraphs: SubgraphId[];
}

export default class Graph {
    constructor(
        public id: GraphId,
        public name: string,
        public nodes: PostId[],
        public nodePositions: Record<PostId, NodePosition>,
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
        return new Graph(graph.id, graph.name, graph.nodes, graph.nodePositions, graph.subgraphs);
    }
}