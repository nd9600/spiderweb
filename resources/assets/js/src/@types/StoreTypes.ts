import type Graph from "@/src/classes/Graph";
import type { GraphSerialised } from "@/src/classes/Graph";
import type Post from "@/src/classes/Post";
import type { PostSerialised } from "@/src/classes/Post";
import type Link from "@/src/classes/Link";
import type { LinkSerialised } from "@/src/classes/Link";
import type Subgraph from "@/src/classes/Subgraph";
import type { SubgraphSerialised } from "@/src/classes/Subgraph";

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
    zoom: Zoom,
    
    // Clicker/UI state
    clickMode?: string,
    shouldShowClickButtonMenu?: boolean,
    linkToEdit?: Nullable<string>
}