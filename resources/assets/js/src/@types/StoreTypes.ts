import type {Post} from "@/src/store/models/Post";
import type {Link} from "@/src/store/models/Link";
import type {DataModuleState} from "@/src/store/models/DataModule";
import type {FirebaseConfig} from "@/src/store/models/Firebase";
import type {
    RemoteStorageMethod,
    ShouldTakeDataFrom
} from "@/src/store/models/Settings";
import type {
    GraphId,
    LinkId,
    LinkType,
    NodePosition,
    PostId,
    SubgraphId,
    Zoom
} from "@/src/store/models/primitives";

export type {
    DataModuleState,
    FirebaseConfig,
    GraphId,
    LinkId,
    LinkType,
    NodePosition,
    PostId,
    RemoteStorageMethod,
    ShouldTakeDataFrom,
    SubgraphId,
    Zoom,
};

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
