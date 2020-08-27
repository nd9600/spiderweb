import Vue from "vue";
import Post from "@/src/offline/store/classes/Post";
import {DataModuleState, LinkId, LinksMap, PostId, PostsMap} from "@/src/@types/StoreTypes";
import Link from "@/src/offline/store/classes/Link";

const state: {
    posts: PostsMap
} = {
    posts: {},
};

const getters = {
    postIds(state: DataModuleState) {
        return Object.keys(state.posts).map(n => parseInt(n, 10));
    },

    unattachedPosts(state: DataModuleState) {
        let attachedPostIDs: PostId[] = [];
        for (let graphObj of Object.values(state.graphs)) {
            attachedPostIDs = attachedPostIDs.concat(graphObj.nodes);
        }
        const uniqueAttachedPostIDs = [...new Set(attachedPostIDs)];
        const postIDs = Object.keys(state.posts)
            .map(n => parseInt(n, 10));

        return postIDs
            .filter(id => !uniqueAttachedPostIDs.includes(id))
            .map(id => state.posts[id]);
    },

    titleOrBody: (state: DataModuleState) => (postId: number) => {
        const MAX_BODY_LENGTH = 30;

        const post = state.posts[postId];
        const possibleTitle = post.title.split("\n")[0].trim(); // we don't want to show text after a newline
        if (possibleTitle.length > 0) {
            return possibleTitle;
        }

        const strToReturn = post.body.split("\n")[0].trim();
        return strToReturn.length > MAX_BODY_LENGTH
            ? strToReturn.substr(0, MAX_BODY_LENGTH) + ".."
            : strToReturn;
    },

    neighbourIndex(state: DataModuleState, getters: any): {[key: string]: number} {
        let neighbourIndex: {[key: string]: number} = {};
        getters.linksInSelectedSubgraphs.forEach(function (link: Link) {
            const lowerId = Math.min(link.source, link.target);
            const higherId = Math.max(link.source, link.target);
            neighbourIndex[lowerId + "," + higherId] = 1;
        });
        return neighbourIndex;
    },

    isNeighbour: (state: DataModuleState, getters: any) => (postA: Post, postB: Post) => {
        const lowerId = Math.min(postA.id, postB.id);
        const higherId = Math.max(postA.id, postB.id);
        return typeof getters.neighbourIndex[lowerId + "," + higherId] !== "undefined";
    },

    postIdsThatLinkToPost: (state: DataModuleState) => (postId: number) => {
        let fromPostIds: Record<LinkId, PostId> = {};
        let toPostIds: Record<LinkId, PostId> = {};

        Object.values(state.links).forEach(function (link) {
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
    },

    linkedSubgraphs: (state: DataModuleState) => (postId: number) => {
        let linkedSubgraphs = [];

        for (let subgraph of Object.values(state.subgraphs)) {
            if (subgraph.nodes.includes(postId)) {
                linkedSubgraphs.push(subgraph.id);
            }
        }
        return linkedSubgraphs;
    },
};

const mutations = {
    createPost(state: DataModuleState, newPost: Post) {
        Vue.set(state.posts, newPost.id, newPost);
        return newPost;
    },
    updatePost(state: DataModuleState, post: Post) {
        Vue.set(state.posts, post.id, post);
    },
    deletePost(state: DataModuleState, {id}: {id: PostId}) {
        if (state.selectedPostIds.includes(id)) {
            state.selectedPostIds.splice(state.selectedPostIds.indexOf(id), 1);
        }

        // we need to remove any links that would include the deleted post
        let linksAfterPostRemoval: LinksMap = {};
        for (const link of Object.values(state.links)) {
            if (
                link.source === id
                || link.target === id
            ) {
                continue;
            }
            linksAfterPostRemoval[link.id] = link;
        }

        // we also need to remove the post from any graphs or subgraphs
        for (let [graphId, graph] of Object.entries(state.graphs)) {
            const newGraph = {
                ...graph,
                nodes: graph.nodes.filter((postId: PostId) => postId !== id)
            };
            Vue.set(state.graphs, graphId, newGraph);
        }
        for (let [subgraphId, subgraph] of Object.entries(state.subgraphs)) {
            const newSubgraph = {
                ...subgraph,
                nodes: subgraph.nodes.filter((postId: PostId) => postId !== id)
            };
            Vue.set(state.subgraphs, subgraphId, newSubgraph);
        }

        Vue.set(state, "links", linksAfterPostRemoval);
        Vue.delete(state.posts, id);
    }
};

const actions = {
    async makeNewPost(context: any, newPost: Post) {
        const existingPostIds = Object.keys(context.state.posts).map(id => parseInt(id, 10));

        const highestPostId = existingPostIds.length === 0
            ? 0
            : Math.max(...existingPostIds);
        const newPostId = highestPostId + 1;

        newPost.id = newPostId;
        context.commit("createPost", newPost);
        return newPost;
    },
};


export default {
    state,
    getters,
    mutations,
    actions
};
