import {LinkId, GraphId, PostId, SubgraphId} from "@/src/@types/StoreTypes";

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