import Graph, {GraphSerialised} from "@/src/offline/store/classes/Graph";
import Post, {PostSerialised} from "@/src/offline/store/classes/Post";
import Link, {LinkSerialised} from "@/src/offline/store/classes/Link";
import Subgraph, {SubgraphSerialised} from "@/src/offline/store/classes/Subgraph";

export type GraphId = string;
export type PostId = string;
export type LinkId = string;
export type SubgraphId = string;

export type GraphsMap = Record<GraphId, Graph>;
export type PostsMap = Record<PostId, Post>;
export type LinksMap = Record<LinkId, Link>;
export type SubgraphsMap = Record<SubgraphId, Subgraph>;
export type NodePositionsMap = Record<PostId, NodePosition>;

export interface Zoom {
    x: number;
    y: number;
    scale: number;
}

export interface NodePosition {
    x: number;
    y: number;
}

export interface DataModuleState {
    graphs: GraphsMap,
    posts: PostsMap,
    links: LinksMap,
    subgraphs: SubgraphsMap,

    selectedPostIds: PostId[],
    selectedGraphId: Nullable<GraphId>,
    selectedSubgraphIds: SubgraphId[],
    zoom: Zoom
}

export interface DataModuleStateSerialised {
    graphs: Record<string, GraphSerialised>,
    posts: Record<string, PostSerialised>,
    links: Record<string, LinkSerialised>,
    subgraphs: Record<string, SubgraphSerialised>,

    selectedPostIds: PostId[],
    selectedGraphId: Nullable<GraphId>,
    selectedSubgraphIds: SubgraphId[],
    zoom: Zoom
}