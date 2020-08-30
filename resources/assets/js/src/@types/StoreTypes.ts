import Graph, {GraphSerialised} from "@/src/offline/store/classes/Graph";
import Post, {PostSerialised} from "@/src/offline/store/classes/Post";
import Link, {LinkSerialised} from "@/src/offline/store/classes/Link";
import Subgraph, {SubgraphSerialised} from "@/src/offline/store/classes/Subgraph";

export type GraphId = number;
export type PostId = number;
export type LinkId = number;
export type SubgraphId = number;

export type GraphsMap = Record<string, Graph>;
export type PostsMap = Record<string, Post>;
export type LinksMap = Record<string, Link>;
export type SubgraphsMap = Record<string, Subgraph>;

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