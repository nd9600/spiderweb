import Graph from "@/src/offline/store/classes/Graph";
import Post from "@/src/offline/store/classes/Post";
import Link from "@/src/offline/store/classes/Link";
import Subgraph from "@/src/offline/store/classes/Subgraph";

export type GraphId = number;
export type PostId = number;
export type LinkId = number;
export type SubgraphId = number;

export type GraphsMap = Record<GraphId, Graph>;
export type PostsMap = Record<PostId, Post>;
export type LinksMap = Record<LinkId, Link>;
export type SubgraphsMap = Record<SubgraphId, Subgraph>;

export interface DataModuleState {
    graphs: GraphsMap,
    posts: PostsMap,
    links: LinksMap,
    subgraphs: SubgraphsMap,

    selectedPostIds: PostId[],
    selectedGraphId: GraphId,
    selectedSubgraphIds: SubgraphId[],
    zoom: {
        x: number,
        y: number,
        scale: number,
    }
}