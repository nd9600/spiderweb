import {LinkId, PostId, SubgraphId} from "@/src/@types/StoreTypes";

export interface SubgraphSerialised {
    id: SubgraphId;
    name: string,
    nodes: PostId[];
    links: LinkId[];
    colour?: string;
}

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