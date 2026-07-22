import type {
    DataModuleState,
    LinkId,
    PostId
} from "@/src/@types/StoreTypes";
import {createPost, type Post} from "@/src/store/models/Post";
import {createDataModulePatch} from "./commit";
import {membershipIds, newRecordId} from "./shared";

interface MakeNewPostPayload {
    title: string;
    body: string;
    updatedAt: string;
    createdAt: string;
}

export interface LinkedPostIds {
    from: Record<LinkId, PostId>;
    to: Record<LinkId, PostId>;
}

export type LinksByPostId = Partial<Record<PostId, LinkedPostIds>>;

function arrayMove<T>(array: Array<T>, fromIndex: number, toIndex: number): Array<T> {
    const arrayCopy = array.slice(0);
    const element = array[fromIndex];
    arrayCopy.splice(fromIndex, 1);
    arrayCopy.splice(toIndex, 0, element);
    return arrayCopy;
}

export default {
    state(): Pick<DataModuleState, "posts" | "selectedPostIds"> {
        return {
            posts: {},
            selectedPostIds: [],
        };
    },
    getters: {
        linksByPostId(store: DataModuleState): LinksByPostId {
            const linksByPostId: LinksByPostId = {};

            for (const link of Object.values(store.links)) {
                (linksByPostId[link.source] ??= {
                    from: {},
                    to: {},
                }).from[link.id] = link.target;

                (linksByPostId[link.target] ??= {
                    from: {},
                    to: {},
                }).to[link.id] = link.source;
            }

            return linksByPostId;
        },
        unattachedPosts(store: DataModuleState): Post[] {
            const attachedPostIds = new Set<PostId>();
            for (const graph of Object.values(store.graphs)) {
                membershipIds(graph.nodes).forEach((postId) => attachedPostIds.add(postId));
            }

            return Object.keys(store.posts)
                .filter((id) => !attachedPostIds.has(id))
                .map((id) => store.posts[id]);
        },
        titleOrBody(store: DataModuleState) {
            return (postId: PostId): string => {
                const maxBodyLength = 30;
                const post = store.posts[postId];
                const possibleTitle = post.title.split("\n")[0].trim();
                if (possibleTitle.length > 0) {
                    return possibleTitle;
                }

                const body = post.body.split("\n")[0].trim();
                return body.length > maxBodyLength
                    ? body.substring(0, maxBodyLength) + ".."
                    : body;
            };
        },
    },
    actions: {
        selectPostId({id, canOpenMultiplePosts}: {id: PostId; canOpenMultiplePosts: boolean}) {
            const selectedPostIdsWithoutId = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);
            const selectedPostIds = canOpenMultiplePosts
                ? [id, ...selectedPostIdsWithoutId]
                : [id];
            return createDataModulePatch(this)
                .setSelectedPostIds(selectedPostIds)
                .commit();
        },
        unselectPostId(id: PostId) {
            return createDataModulePatch(this)
                .setSelectedPostIds(this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id))
                .commit();
        },
        togglePostId({id, canOpenMultiplePosts}: {id: PostId; canOpenMultiplePosts: boolean}) {
            let selectedPostIds: PostId[];
            if (this.selectedPostIds.includes(id)) {
                selectedPostIds = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);
            } else if (canOpenMultiplePosts) {
                selectedPostIds = [id, ...this.selectedPostIds];
            } else {
                selectedPostIds = [id];
            }
            return createDataModulePatch(this)
                .setSelectedPostIds(selectedPostIds)
                .commit();
        },
        movePostLeft(id: PostId) {
            const currentIndex = this.selectedPostIds.indexOf(id);
            if (currentIndex < 0 || this.selectedPostIds.length === 0) {
                return;
            }

            const newIndex = currentIndex === 0
                ? this.selectedPostIds.length - 1
                : currentIndex - 1;
            return createDataModulePatch(this)
                .setSelectedPostIds(arrayMove(this.selectedPostIds, currentIndex, newIndex))
                .commit();
        },
        movePostRight(id: PostId) {
            const currentIndex = this.selectedPostIds.indexOf(id);
            if (currentIndex < 0 || this.selectedPostIds.length === 0) {
                return;
            }

            const newIndex = currentIndex === (this.selectedPostIds.length - 1)
                ? 0
                : currentIndex + 1;
            return createDataModulePatch(this)
                .setSelectedPostIds(arrayMove(this.selectedPostIds, currentIndex, newIndex))
                .commit();
        },
        updatePostTitle({id, title, updatedAt}: {id: PostId; title: string; updatedAt: string}) {
            return createDataModulePatch(this)
                .setPostTitle(id, title)
                .setPostUpdatedAt(id, updatedAt)
                .commit();
        },
        updatePostBody({id, body, updatedAt}: {id: PostId; body: string; updatedAt: string}) {
            return createDataModulePatch(this)
                .setPostBody(id, body)
                .setPostUpdatedAt(id, updatedAt)
                .commit();
        },
        deletePost({id}: {id: PostId}) {
            const patch = createDataModulePatch(this)
                .deletePost(id);
            const nextSelectedPostIds = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);
            if (nextSelectedPostIds.length !== this.selectedPostIds.length) {
                patch.setSelectedPostIds(nextSelectedPostIds);
            }

            for (const link of Object.values(this.links)) {
                if (link.source === id || link.target === id) {
                    patch.deleteLink(link.id);
                    for (const subgraph of Object.values(this.subgraphs)) {
                        patch.removeLinkFromSubgraph(subgraph.id, link.id);
                    }
                }
            }

            for (const graph of Object.values(this.graphs)) {
                patch.removePostFromGraph(graph.id, id);
                patch.deletePostPosition(graph.id, id);
            }

            for (const subgraph of Object.values(this.subgraphs)) {
                patch.removePostFromSubgraph(subgraph.id, id);
            }

            return patch.commit();
        },
        makeNewPost({title, body, updatedAt, createdAt}: MakeNewPostPayload) {
            const newPostId = newRecordId();
            const newPost = createPost(newPostId, title, body, createdAt, updatedAt);
            createDataModulePatch(this)
                .setPost(newPost)
                .commit();
            return newPost;
        },
    } satisfies ThisType<DataModuleState>,
};
