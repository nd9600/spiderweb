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
}