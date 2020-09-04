import {GraphId, LinkId, PostId, SubgraphId} from "@/src/@types/StoreTypes";

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

    serialise(): LinkSerialised {
        return {
            id: this.id,
            graph: this.graph,
            source: this.source,
            target: this.target,
            type: this.type
        }
    }

    static unserialise(link: LinkSerialised): Link {
        return new Link(String(link.id), String(link.graph), String(link.source), String(link.target), link.type)
    }
}