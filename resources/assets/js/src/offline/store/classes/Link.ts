import { LinkId, GraphId, PostId } from "@/src/@types/StoreTypes";

export default class Link {
  constructor(
        public id: LinkId,
        public graph: GraphId,
        public source: PostId,
        public target: PostId,
        public type: string = "reply"
    ) {
    }
}