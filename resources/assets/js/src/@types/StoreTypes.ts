import Graph from "@/src/offline/store/classes/Graph";
import Post from "@/src/offline/store/classes/Post";
import Link from "@/src/offline/store/classes/Link";
import Subgraph from "@/src/offline/store/classes/Subgraph";

export type GraphId = number;
export type PostId = number;
export type LinkId = number;
export type SubgraphId = number;

export type GraphsMap = Record<string, Graph>;
export type PostsMap = Record<string, Post>;
export type LinksMap = Record<string, Link>;
export type SubgraphsMap = Record<string, Subgraph>;

export type Zoom = {
    x: number,
    y: number,
    scale: number,
};

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