import type {GraphSerialised} from "@/src/store/classes/Graph";
import type {PostSerialised} from "@/src/store/classes/Post";
import type {LinkSerialised} from "@/src/store/classes/Link";
import type {SubgraphSerialised} from "@/src/store/classes/Subgraph";

export type GraphId = string;
export type PostId = string;
export type LinkId = string;
export type SubgraphId = string;
export type LinkType = "reply" | "sidenote" | "link";
export type RemoteStorageMethod = "none" | "firebase";
export type ShouldTakeDataFrom = "local" | "firebase";
export type ClickMode =
    | "openPosts"
    | "addLink"
    | "changeLink"
    | "addPost"
    | "attachPostsToGraphs"
    | "searchForPosts";

export type PostsMap = Record<PostId, PostSerialised>;
export type LinksMap = Record<LinkId, LinkSerialised>;
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
    graphs: Record<GraphId, GraphSerialised>,
    posts: PostsMap,
    links: LinksMap,
    subgraphs: Record<SubgraphId, SubgraphSerialised>,

    selectedPostIds: PostId[],
    selectedGraphId: Nullable<GraphId>,
    selectedSubgraphIds: SubgraphId[],
    zoom: Zoom
}

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}
