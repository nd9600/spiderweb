import {LinkId, PostId, SubgraphId} from "@/src/@types/StoreTypes";

export default class Subgraph {
  constructor(
        public id: SubgraphId,
        public name: string,
        public nodes: PostId[],
        public links: LinkId[],
        public colour?: string,
    ) {
    }
}