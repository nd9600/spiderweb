import {LinkId, GraphId, PostId, SubgraphId} from "@/src/@types/StoreTypes";

export interface LinkSerialised {
    id: LinkId;
    graph: GraphId;
    source: PostId;
    target: PostId;
    type: string;
}

export default class Link {
  public subgraphId?: SubgraphId;

  constructor(
        public id: LinkId,
        public graph: GraphId,
        public source: PostId,
        public target: PostId,
        public type: string = "reply"
    ) {
    }
}