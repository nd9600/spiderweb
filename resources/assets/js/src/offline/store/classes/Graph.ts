import {GraphId, PostId, SubgraphId} from "@/src/@types/StoreTypes";

export default class Graph {
  constructor(
        public id: GraphId,
        public name: string,
        public nodes: PostId[],
        public subgraphs: SubgraphId[],
    ) {
    }
}