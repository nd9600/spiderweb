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

    serialise(): SubgraphSerialised {
        return {
            id: this.id,
            name: this.name,
            nodes: this.nodes,
            links: this.links,
            colour: this.colour
        }
    }

    static unserialise(subgraph: SubgraphSerialised): Subgraph {
        return new Subgraph(String(subgraph.id), subgraph.name, subgraph.nodes.map(String), subgraph.links.map(String), subgraph.colour);
    }
}