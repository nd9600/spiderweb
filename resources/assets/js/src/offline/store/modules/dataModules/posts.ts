import Vue from "vue";
import Post, {PostSerialised} from "@/src/offline/store/classes/Post";
import {DataModuleState, LinkId, LinksMap, NodePositionsMap, PostId, PostsMap} from "@/src/@types/StoreTypes";
import Link from "@/src/offline/store/classes/Link";

const state: {
    posts: PostsMap
} = {
    posts: {},
};

const getters = {
    postIds(state: DataModuleState) {
        return Object.keys(state.posts);
    },

    unattachedPosts(state: DataModuleState) {
        let attachedPostIDs: PostId[] = [];
        for (let graphObj of Object.values(state.graphs)) {
            attachedPostIDs = attachedPostIDs.concat(graphObj.nodes);
        }
        const uniqueAttachedPostIDs = [...new Set(attachedPostIDs)];
        const postIDs = Object.keys(state.posts);
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
            const source = parseInt(link.source, 10);
            const target = parseInt(link.target, 10);
            const lowerId = Math.min(source, target);
            const higherId = Math.max(source, target);
            neighbourIndex[lowerId + "," + higherId] = 1;
        });
        return neighbourIndex;
    },

    isNeighbour: (state: DataModuleState, getters: any) => (postAId: PostId, postBId: PostId) => {
        const a = parseInt(postAId, 10);
        const b = parseInt(postBId, 10);
        const lowerId = Math.min(a, b);
        const higherId = Math.max(a, b);
        return typeof getters.neighbourIndex[lowerId + "," + higherId] !== "undefined";
    },

    postIdsThatLinkToPost: (state: DataModuleState) => (postId: PostId) => {
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

    linkedSubgraphs: (state: DataModuleState) => (postId: PostId) => {
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
        Vue.set(state.posts, newPost.id, newPost.serialise());
        return newPost;
    },
    updatePostTitle(state: DataModuleState, {id, title, updatedAt}: {id: PostId, title: string, updatedAt: string}) {
        const post = JSON.parse(JSON.stringify(state.posts[id])); // Vue won't realize we've changed the post otherwise, so the graph won't get re-rendered
        post.title = title;
        post.updatedAt = updatedAt;
        Vue.set(state.posts, id, post);
    },
    updatePostBody(state: DataModuleState, {id, body, updatedAt}: {id: PostId, body: string, updatedAt: string}) {
        Vue.set(state.posts[id], "body", body);
        Vue.set(state.posts[id], "updatedAt", updatedAt);
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
                for (const subgraphId of Object.keys(state.subgraphs)) {
                    const indexOfLink = state.subgraphs[subgraphId].links.indexOf(link.id);
                    const alreadyInSubgraph = indexOfLink >= 0;
                    if (alreadyInSubgraph) {
                        state.subgraphs[subgraphId].links.splice(indexOfLink, 1);
                    }
                }
                continue;
            }
            linksAfterPostRemoval[link.id] = link;
        }

        // we also need to remove the post from any graphs or subgraphs
        for (let [graphId, graph] of Object.entries(state.graphs)) {
            let nodePositions: NodePositionsMap = {};
            for (const [postId, position] of Object.entries(graph.nodePositions)) {
                if (postId !== id) {
                    nodePositions[postId] = position;
                }
            }
            const newGraph = {
                ...graph,
                nodes: graph.nodes.filter((postId: PostId) => postId !== id),
                nodePositions
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

        // and the post's positions from any graphs

        Vue.set(state, "links", linksAfterPostRemoval);
        Vue.delete(state.posts, id);
    }
};

const actions = {
    async makeNewPost(context: any, {title, body, updatedAt, createdAt}: {title: string, body: string, updatedAt: string, createdAt: string}) {
        const existingPostIds = Object.keys(context.state.posts).map(id => parseInt(id, 10));

        const highestPostId = existingPostIds.length === 0
            ? 0
            : Math.max(...existingPostIds);
        const newPostId = String(highestPostId + 1);

        const newPost = new Post(newPostId, title, body, createdAt, updatedAt);
        context.commit("createPost", newPost);
        return newPost;
    },

    async updatePostTitle(context: any, payload: {id: PostId, title: string, updatedAt: string}) {
        context.commit("updatePostTitle", payload);
    },
    async updatePostBody(context: any, payload: {id: PostId, body: string, updatedAt: string}) {
        context.commit("updatePostBody", payload);
    },
};


export default {
    state,
    getters,
    mutations,
    actions
};
