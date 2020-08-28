import {GraphId, PostId, SubgraphId} from "@/src/@types/StoreTypes";

export interface GraphSerialised {
    id: GraphId;
    name: string,
    nodes: PostId[];
    subgraphs: SubgraphId[];
}

export default class Graph {
    constructor(
        public id: GraphId,
        public name: string,
        public nodes: PostId[],
        public subgraphs: SubgraphId[],
    ) {
    }

    serialise(): GraphSerialised {
        return {
            id: this.id,
            name: this.name,
            nodes: this.nodes,
            subgraphs: this.subgraphs
        }
    }

    static unserialise(graph: GraphSerialised): Graph {
        return new Graph(graph.id, graph.name, graph.nodes, graph.subgraphs);
    }
}