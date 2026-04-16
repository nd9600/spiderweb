import type {GraphSerialised} from "@/src/offline/store/classes/Graph";
import type {PostSerialised} from "@/src/offline/store/classes/Post";
import type {LinkSerialised} from "@/src/offline/store/classes/Link";
import type {SubgraphSerialised} from "@/src/offline/store/classes/Subgraph";

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

export type GraphsMap = Record<GraphId, GraphSerialised>;
export type PostsMap = Record<PostId, PostSerialised>;
export type LinksMap = Record<LinkId, LinkSerialised>;
export type SubgraphsMap = Record<SubgraphId, SubgraphSerialised>;
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

export interface SettingsModuleState {
    shouldAutosave: boolean;
    remoteStorageMethod: RemoteStorageMethod;
    canOpenMultiplePosts: boolean;
    graphHeight: number;
    postBarHeight: number;
    postWidth: number;
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

export interface FirebaseModuleState {
    firebaseConfig: FirebaseConfig;
}

export interface ClickerModuleState {
    shouldShowClickButtonMenu: boolean;
    clickMode: ClickMode;
    newLinkSource: Nullable<PostId>;
    newLinkTarget: Nullable<PostId>;
    newLinkType: LinkType;
    newLinkSubgraphIds: SubgraphId[];
    linkToEdit: Nullable<LinkId>;
    wantsToChangeSource: boolean;
    wantsToChangeTarget: boolean;
}

export interface RootUiState {
    loadingApp: boolean;
    failedToLoadData: boolean;
    isRenderingGraph: boolean;
}

export interface RootStoreState extends RootUiState {
    settingsModule: SettingsModuleState;
    firebaseModule: FirebaseModuleState;
    dataModule: DataModuleState;
    clickerModule: ClickerModuleState;
}

export interface OfflineStorageObject {
    dataModule: DataModuleState;
    settingsModule: SettingsModuleState;
    firebaseModule: FirebaseModuleState;
}

export interface OfflineStorageObjectSerialised {
    dataModule: DataModuleStateSerialised;
    settingsModule: SettingsModuleState;
    firebaseModule: FirebaseModuleState;
}

export type ImportedStorageObject = Partial<OfflineStorageObjectSerialised> & {
    postsModule?: DataModuleStateSerialised;
};
