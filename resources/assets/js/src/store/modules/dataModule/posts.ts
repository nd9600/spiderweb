import type {
    DataModuleState,
    LinkId,
    LinksMap,
    PostId
} from "@/src/@types/StoreTypes";
import Post, {type PostSerialised} from "@/src/store/classes/Post";
import {removePostPositionFromGraph} from "./graphs";
import {removeLinkFromSubgraphs} from "./links";
import {nextStringId} from "./shared";

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
        graph.nodes = graph.nodes.filter((id) => id !== postId);
        removePostPositionFromGraph(graph, postId);
    }

    for (const subgraph of Object.values(state.subgraphs)) {
        subgraph.nodes = subgraph.nodes.filter((id) => id !== postId);
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
    },
    unselectPostId(id: PostId) {
        this.selectedPostIds = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);
    },
    togglePostId({id, canOpenMultiplePosts}: {id: PostId; canOpenMultiplePosts: boolean}) {
        if (this.selectedPostIds.includes(id)) {
            this.selectedPostIds = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);
        } else if (canOpenMultiplePosts) {
            this.selectedPostIds.unshift(id);
        } else {
            this.selectedPostIds = [id];
        }
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
    },
    updatePostTitle({id, title, updatedAt}: {id: PostId; title: string; updatedAt: string}) {
        this.posts[id].title = title;
        this.posts[id].updatedAt = updatedAt;
    },
    updatePostBody({id, body, updatedAt}: {id: PostId; body: string; updatedAt: string}) {
        this.posts[id].body = body;
        this.posts[id].updatedAt = updatedAt;
    },
    deletePost({id}: {id: PostId}) {
        deletePostState(this, id);
    },
    makeNewPost({title, body, updatedAt, createdAt}: MakeNewPostPayload) {
        const newPostId = nextStringId(this.posts);
        const newPost = new Post(newPostId, title, body, createdAt, updatedAt);
        this.posts[newPostId] = newPost.serialise();
        return newPost;
    },
} satisfies ThisType<DataModuleState>;

export const postGetters = {
    postIds(store: DataModuleState): PostId[] {
        return Object.keys(store.posts);
    },
    unattachedPosts(store: DataModuleState): PostSerialised[] {
        const attachedPostIds = new Set<PostId>();
        for (const graph of Object.values(store.graphs)) {
            graph.nodes.forEach((postId) => attachedPostIds.add(postId));
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
