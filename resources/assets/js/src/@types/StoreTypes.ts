export type {DataModuleState} from "@/src/store/models/DataModule";
export type {FirebaseConfig} from "@/src/store/models/Firebase";
export type {
    RemoteStorageMethod,
    ShouldTakeDataFrom
} from "@/src/store/models/Settings";
export type {
    GraphId,
    LinkId,
    LinkType,
    NodePosition,
    PostId,
    SubgraphId,
    Zoom
} from "@/src/store/models/primitives";

export enum ClickMode {
    OpenPosts = "openPosts",
    AddLink = "addLink",
    ChangeLink = "changeLink",
    AddPost = "addPost",
    AttachPostsToGraphs = "attachPostsToGraphs",
    SearchForPosts = "searchForPosts",
}
