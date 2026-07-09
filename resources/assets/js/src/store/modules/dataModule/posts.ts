import type {
    DataModuleState,
    LinkId,
    LinksMap,
    PostId
} from "@/src/@types/StoreTypes";
import {createPost, type Post} from "@/src/store/models/Post";
import {writeFirebaseDataModulePatch, type FirebaseUpdatePatch} from "@/src/store/remoteSync";
import {removePostPositionFromGraph} from "./graphs";
import {removeLinkFromSubgraphs} from "./links";
import {membershipIds, newRecordId, removeMembership} from "./shared";

interface MakeNewPostPayload {
    title: string;
    body: string;
    updatedAt: string;
    createdAt: string;
}

export function postState(): Pick<DataModuleState, "posts" | "selectedPostIds"> {
    return {
        posts: {},
        selectedPostIds: [],
    };
}

function arrayMove<T>(array: Array<T>, fromIndex: number, toIndex: number): Array<T> {
    const arrayCopy = array.slice(0);
    const element = array[fromIndex];
    arrayCopy.splice(fromIndex, 1);
    arrayCopy.splice(toIndex, 0, element);
    return arrayCopy;
}

function removeLinksThatIncludePost(state: DataModuleState, postId: PostId): void {
    const linksAfterRemoval: LinksMap = {};
    for (const link of Object.values(state.links)) {
        if (link.source === postId || link.target === postId) {
            removeLinkFromSubgraphs(state, link.id);
            continue;
        }

        linksAfterRemoval[link.id] = link;
    }

    state.links = linksAfterRemoval;
}

function deletePostState(state: DataModuleState, postId: PostId): void {
    state.selectedPostIds = state.selectedPostIds.filter((id) => id !== postId);
    removeLinksThatIncludePost(state, postId);

    for (const graph of Object.values(state.graphs)) {
        removeMembership(graph.nodes, postId);
        removePostPositionFromGraph(graph, postId);
    }

    for (const subgraph of Object.values(state.subgraphs)) {
        removeMembership(subgraph.nodes, postId);
    }

    delete state.posts[postId];
}

export const postActions = {
    selectPostId({id, canOpenMultiplePosts}: {id: PostId; canOpenMultiplePosts: boolean}) {
        this.selectedPostIds = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);

        if (canOpenMultiplePosts) {
            this.selectedPostIds.unshift(id);
        } else {
            this.selectedPostIds = [id];
        }
        writeFirebaseDataModulePatch({
            "dataModule/selectedPostIds": this.selectedPostIds,
        });
    },
    unselectPostId(id: PostId) {
        this.selectedPostIds = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);
        writeFirebaseDataModulePatch({
            "dataModule/selectedPostIds": this.selectedPostIds,
        });
    },
    togglePostId({id, canOpenMultiplePosts}: {id: PostId; canOpenMultiplePosts: boolean}) {
        if (this.selectedPostIds.includes(id)) {
            this.selectedPostIds = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);
        } else if (canOpenMultiplePosts) {
            this.selectedPostIds.unshift(id);
        } else {
            this.selectedPostIds = [id];
        }
        writeFirebaseDataModulePatch({
            "dataModule/selectedPostIds": this.selectedPostIds,
        });
    },
    movePostLeft(id: PostId) {
        const currentIndex = this.selectedPostIds.indexOf(id);
        if (currentIndex < 0 || this.selectedPostIds.length === 0) {
            return;
        }

        const newIndex = currentIndex === 0
            ? this.selectedPostIds.length - 1
            : currentIndex - 1;
        this.selectedPostIds = arrayMove(this.selectedPostIds, currentIndex, newIndex);
        writeFirebaseDataModulePatch({
            "dataModule/selectedPostIds": this.selectedPostIds,
        });
    },
    movePostRight(id: PostId) {
        const currentIndex = this.selectedPostIds.indexOf(id);
        if (currentIndex < 0 || this.selectedPostIds.length === 0) {
            return;
        }

        const newIndex = currentIndex === (this.selectedPostIds.length - 1)
            ? 0
            : currentIndex + 1;
        this.selectedPostIds = arrayMove(this.selectedPostIds, currentIndex, newIndex);
        writeFirebaseDataModulePatch({
            "dataModule/selectedPostIds": this.selectedPostIds,
        });
    },
    updatePostTitle({id, title, updatedAt}: {id: PostId; title: string; updatedAt: string}) {
        this.posts[id].title = title;
        this.posts[id].updatedAt = updatedAt;
        writeFirebaseDataModulePatch({
            [`dataModule/posts/${id}/title`]: title,
            [`dataModule/posts/${id}/updatedAt`]: updatedAt,
        });
    },
    updatePostBody({id, body, updatedAt}: {id: PostId; body: string; updatedAt: string}) {
        this.posts[id].body = body;
        this.posts[id].updatedAt = updatedAt;
        writeFirebaseDataModulePatch({
            [`dataModule/posts/${id}/body`]: body,
            [`dataModule/posts/${id}/updatedAt`]: updatedAt,
        });
    },
    deletePost({id}: {id: PostId}) {
        // Firebase has no database-level cascade here; keep the explicit graph/link/subgraph cleanup in the domain action.
        const patch: FirebaseUpdatePatch = {
            [`dataModule/posts/${id}`]: null,
        };
        const nextSelectedPostIds = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);
        if (nextSelectedPostIds.length !== this.selectedPostIds.length) {
            patch["dataModule/selectedPostIds"] = nextSelectedPostIds;
        }

        for (const link of Object.values(this.links)) {
            if (link.source === id || link.target === id) {
                patch[`dataModule/links/${link.id}`] = null;
                for (const subgraph of Object.values(this.subgraphs)) {
                    patch[`dataModule/subgraphs/${subgraph.id}/links/${link.id}`] = null;
                }
            }
        }

        for (const graph of Object.values(this.graphs)) {
            patch[`dataModule/graphs/${graph.id}/nodes/${id}`] = null;
            patch[`dataModule/graphs/${graph.id}/nodePositions/${id}`] = null;
        }

        for (const subgraph of Object.values(this.subgraphs)) {
            patch[`dataModule/subgraphs/${subgraph.id}/nodes/${id}`] = null;
        }

        deletePostState(this, id);
        writeFirebaseDataModulePatch(patch);
    },
    makeNewPost({title, body, updatedAt, createdAt}: MakeNewPostPayload) {
        const newPostId = newRecordId();
        const newPost = createPost(newPostId, title, body, createdAt, updatedAt);
        this.posts[newPostId] = newPost;
        writeFirebaseDataModulePatch({
            [`dataModule/posts/${newPostId}`]: newPost,
        });
        return newPost;
    },
} satisfies ThisType<DataModuleState>;

export const postGetters = {
    postIds(store: DataModuleState): PostId[] {
        return Object.keys(store.posts);
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
    postIdsThatLinkToPost(store: DataModuleState) {
        return (postId: PostId): {from: Record<LinkId, PostId>; to: Record<LinkId, PostId>} => {
            const fromPostIds: Record<LinkId, PostId> = {};
            const toPostIds: Record<LinkId, PostId> = {};

            Object.values(store.links).forEach((link) => {
                if (link.source === postId) {
                    fromPostIds[link.id] = link.target;
                } else if (link.target === postId) {
                    toPostIds[link.id] = link.source;
                }
            });

            return {
                from: fromPostIds,
                to: toPostIds,
            };
        };
    },
};
