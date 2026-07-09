import type {Graph} from "@/src/store/models/Graph";
import type {Post} from "@/src/store/models/Post";
import type {Link} from "@/src/store/models/Link";
import type {Subgraph} from "@/src/store/models/Subgraph";

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

export type PostsMap = Record<PostId, Post>;
export type LinksMap = Record<LinkId, Link>;
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
    graphs: Record<GraphId, Graph>,
    posts: PostsMap,
    links: LinksMap,
    subgraphs: Record<SubgraphId, Subgraph>,

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
