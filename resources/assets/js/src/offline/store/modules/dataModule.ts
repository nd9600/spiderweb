import {defineStore} from "pinia";
import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/commonComponents/constants";

import graphs from "./dataModules/graphs";
import posts from "./dataModules/posts";
import links from "./dataModules/links";
import subgraphs from "./dataModules/subgraphs";
import {
    DataModuleState,
    DataModuleStateSerialised,
    GraphId,
    LinkId,
    LinkType,
    PostId,
    SubgraphId,
    Zoom
} from "@/src/@types/StoreTypes";
import Post, {PostSerialised} from "@/src/offline/store/classes/Post";
import Subgraph, {SubgraphSerialised} from "@/src/offline/store/classes/Subgraph";
import Link, {LinkSerialised} from "@/src/offline/store/classes/Link";
import Graph from "@/src/offline/store/classes/Graph";
import {useRootStore} from "./rootStore";


/*
We have multiple graphs
 * each graph can have multiple nodes (which are posts) and multiple (directed) links
 * each graph can be subgraphs, which are named and coloured subsets of posts and links

Posts can live independently of graphs, but links can't - they're a part of graphs

When you create a graph, it has no posts, links or subgraphs
When you delete a graph, also remove any links or subgraphs it has

When you create a post, do nothing else
When you delete a post, also remove any links that have it as a source or target, remove it from any subgraphs, remove it from any graphs, and remove its positions

When you add a post (to a graph), do nothing else
When you remove a post (from a graph), also remove any links that have it as a source or target, remove it from any of the graph's subgraphs, and remove its positions

When you create a link (to a graph), if its target or source post isn't in the graph, add them to the graph, and if its target or source post isn't in the subgraph, add them to the subgraph
When you delete a link (from a graph), remove it from any subgraphs

When you add a post (to a subgraph), do nothing else
When you remove a post (from a subgraph), also remove any links from the subgraph that have it as a source or target

When you add a link (to a subgraph), if its target or source post isn't in the subgraph, add them to the subgraph
When you remove a link (from a subgraph), do nothing else

When you create a subgraph, it has no posts or links
When you delete a subgraph, remove it from its graph
 */

function arrayMove<T>(array: Array<T>, fromIndex: number, toIndex: number) {
    let arrayCopy = array.slice(0);
    const element = array[fromIndex];
    arrayCopy.splice(fromIndex, 1);
    arrayCopy.splice(toIndex, 0, element);
    return arrayCopy;
}

function objectMap<T, S>(f: (o: T) => S, o: Record<string, T>): Record<string, S> {
    return Object.assign({}, ...Object.keys(o).map(k => ({ [k]: f(o[k]) })))
}

type LinkWithSubgraphId = LinkSerialised & {
    subgraphId?: SubgraphId;
};

const state: DataModuleState = {
    ...graphs.state,
    ...posts.state,
    ...links.state,
    ...subgraphs.state,

    selectedPostIds: [],
    selectedGraphId: "1",
    selectedSubgraphIds: [],
    zoom: {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        scale: INITIAL_ZOOM,
    }
};

const mutations = {
    ...graphs.mutations,
    ...posts.mutations,
    ...links.mutations,
    ...subgraphs.mutations,

    setState(state: DataModuleState, newState: DataModuleStateSerialised) {
        if (
            Object.keys(newState).length === 0
            || Object.keys(newState.posts).length === 0
        ) {
            return;
        }

        state.graphs = objectMap(Graph.unserialise, newState.graphs);
        state.posts = objectMap(Post.unserialise, newState.posts);
        state.links = objectMap(Link.unserialise, newState.links);
        state.subgraphs = newState.subgraphs == null
            ? {}
            :  objectMap(Subgraph.unserialise, newState.subgraphs);

        state.selectedPostIds = newState.selectedPostIds.map(String) || [];
        state.selectedGraphId = String(newState.selectedGraphId) || "1";
        state.selectedSubgraphIds = newState.selectedSubgraphIds.map(String) || [];

        state.zoom = newState.zoom || {
            x: WIDTH / 2,
            y: HEIGHT / 2,
            scale: INITIAL_ZOOM,
        };
    },

    setSelectedPostIds(state: DataModuleState, selectedPostIds: PostId[]) {
        state.selectedPostIds = selectedPostIds;
    },
    selectPostId(state: DataModuleState, {id, canOpenMultiplePosts}: {id: PostId, canOpenMultiplePosts: boolean}) {
        if (state.selectedPostIds.includes(id)) { // we want to move it to the front of the list
            state.selectedPostIds.splice(state.selectedPostIds.indexOf(id), 1);
        }
        
        if (canOpenMultiplePosts) {
            state.selectedPostIds.unshift(id);
        } else {
            state.selectedPostIds = [id];
        }
    },
    unselectPostId(state: DataModuleState, id: PostId) {
        state.selectedPostIds.splice(state.selectedPostIds.indexOf(id), 1);
    },
    togglePostId(state: DataModuleState, {id, canOpenMultiplePosts}: {id: PostId, canOpenMultiplePosts: boolean}) {
        if (state.selectedPostIds.includes(id)) {
            state.selectedPostIds.splice(state.selectedPostIds.indexOf(id), 1);
        } else {
            if (canOpenMultiplePosts) {
                state.selectedPostIds.unshift(id);
            } else {
                state.selectedPostIds = [id];
            }
        }
    },
    movePostLeft(state: DataModuleState, id: PostId) {
        const currentIndex = state.selectedPostIds.indexOf(id);
        const newIndex = currentIndex === 0
            ? state.selectedPostIds.length - 1
            : currentIndex - 1;
        state.selectedPostIds = arrayMove(state.selectedPostIds, currentIndex, newIndex);
    },
    movePostRight(state: DataModuleState, id: PostId) {
        const currentIndex = state.selectedPostIds.indexOf(id);
        const newIndex = currentIndex === (state.selectedPostIds.length - 1)
            ? 0
            : currentIndex + 1;
        state.selectedPostIds = arrayMove(state.selectedPostIds, currentIndex, newIndex);
    },

    setSelectedGraphId(state: DataModuleState, selectedGraphId: GraphId) {
        state.selectedSubgraphIds = [];
        state.selectedGraphId = selectedGraphId;
    },

    setSelectedSubgraphIds(state: DataModuleState, selectedSubgraphIds: SubgraphId[]) {
        state.selectedSubgraphIds = selectedSubgraphIds;
    },
    selectAllSubgraphs(state: DataModuleState) {
        state.selectedSubgraphIds = state.graphs[state.selectedGraphId!].subgraphs;
    },
    toggleSubgraphId(state: DataModuleState, subgraphId: SubgraphId) {
        if (state.selectedSubgraphIds.includes(subgraphId)) {
            state.selectedSubgraphIds.splice(state.selectedSubgraphIds.indexOf(subgraphId), 1);
        } else {
            state.selectedSubgraphIds.push(subgraphId);
        }
    },

    setZoom(state: DataModuleState, zoom: Zoom) {
        state.zoom = zoom;
    }
};

const actions = {
    ...graphs.actions,
    ...posts.actions,
    ...links.actions,
    ...subgraphs.actions,
};

function scheduleAutosave() {
    const rootStore = useRootStore();
    if (rootStore != null) {
        rootStore.scheduleAutosave();
    }
}

export const useDataStore = defineStore("dataModule", {
    state: (): DataModuleState => ({
        graphs: {
            ...state.graphs,
        },
        posts: {
            ...state.posts,
        },
        links: {
            ...state.links,
        },
        subgraphs: {
            ...state.subgraphs,
        },
        selectedPostIds: [],
        selectedGraphId: "1",
        selectedSubgraphIds: [],
        zoom: {
            x: WIDTH / 2,
            y: HEIGHT / 2,
            scale: INITIAL_ZOOM,
        }
    }),
    getters: {
        postIds(store): PostId[] {
            return posts.getters.postIds(store);
        },
        unattachedPosts(store) {
            return posts.getters.unattachedPosts(store);
        },
        titleOrBody(store) {
            return posts.getters.titleOrBody(store);
        },
        neighbourIndex(store): {[key: string]: number} {
            return posts.getters.neighbourIndex(store, this);
        },
        isNeighbour(store) {
            return posts.getters.isNeighbour(store, this);
        },
        postIdsThatLinkToPost(store) {
            return posts.getters.postIdsThatLinkToPost(store);
        },
        linkedSubgraphs(store) {
            return posts.getters.linkedSubgraphs(store);
        },
        linkIds(store): LinkId[] {
            return links.getters.linkIds(store);
        },
        subgraphsLinkIsIn(store) {
            return links.getters.subgraphsLinkIsIn(store);
        },
        subgraphColour(store) {
            return subgraphs.getters.subgraphColour(store);
        },
        subgraphsInSelectedGraph(store): SubgraphSerialised[] {
            const graphId = store.selectedGraphId;
            if (graphId == null || store.graphs[graphId] == null) {
                return [];
            }

            return store.graphs[graphId].subgraphs.map(id => store.subgraphs[id]);
        },
        postIdsInSelectedSubgraphs(store): PostId[] {
            let postIDs: PostId[] = [];
            if (store.selectedSubgraphIds.length > 0) {
                for (const selectedSubgraphId of store.selectedSubgraphIds) {
                    postIDs = postIDs.concat(store.subgraphs[selectedSubgraphId].nodes);
                }
            } else if (store.selectedGraphId != null && store.graphs[store.selectedGraphId] != null) {
                postIDs = store.graphs[store.selectedGraphId].nodes;
            }

            return [...new Set(postIDs.filter(id => id != null))];
        },
        postsInSelectedSubgraphs(store): PostSerialised[] {
            const postIdsInSelectedSubgraphs = store.selectedSubgraphIds.length > 0
                ? [...new Set(store.selectedSubgraphIds.reduce((postIds: PostId[], selectedSubgraphId) => {
                    return postIds.concat(store.subgraphs[selectedSubgraphId].nodes.filter((id): id is PostId => id != null));
                }, []))]
                : (store.selectedGraphId != null && store.graphs[store.selectedGraphId] != null ? store.graphs[store.selectedGraphId].nodes : []);

            return postIdsInSelectedSubgraphs.map((id: PostId) => store.posts[id]);
        },
        linksInSelectedSubgraphs(store): LinkWithSubgraphId[] {
            if (store.selectedSubgraphIds.length > 0) {
                let linksWithSubgraphIDs: Array<{linkId: LinkId; subgraphId: SubgraphId}> = [];
                for (const selectedSubgraphId of store.selectedSubgraphIds) {
                    linksWithSubgraphIDs = linksWithSubgraphIDs.concat(
                        store.subgraphs[selectedSubgraphId].links.map((linkId) => ({
                            linkId,
                            subgraphId: selectedSubgraphId,
                        }))
                    );
                }

                return linksWithSubgraphIDs.map(({linkId, subgraphId}): LinkWithSubgraphId => {
                    const link = JSON.parse(JSON.stringify(store.links[linkId])) as LinkWithSubgraphId;
                    link.subgraphId = subgraphId;
                    return link;
                });
            }

            const linkToSubgraphMap: Record<LinkId, SubgraphId> = {};
            for (const subgraph of Object.values(store.subgraphs)) {
                for (const linkId of subgraph.links) {
                    linkToSubgraphMap[linkId] = subgraph.id;
                }
            }

            return Object.values(store.links)
                .filter((link) => store.selectedGraphId === link.graph)
                .map((link): LinkWithSubgraphId => {
                    const subgraphId = linkToSubgraphMap[link.id];
                    if (subgraphId) {
                        const linkWithSubgraphId = JSON.parse(JSON.stringify(store.links[link.id])) as LinkWithSubgraphId;
                        linkWithSubgraphId.subgraphId = subgraphId;
                        return linkWithSubgraphId;
                    }
                    return link as LinkWithSubgraphId;
                });
        },
    },
    actions: {
        setState(newState: DataModuleStateSerialised) {
            mutations.setState(this, newState);
        },
        setSelectedPostIds(selectedPostIds: PostId[]) {
            mutations.setSelectedPostIds(this, selectedPostIds);
            scheduleAutosave();
        },
        selectPostId(payload: {id: PostId; canOpenMultiplePosts: boolean}) {
            mutations.selectPostId(this, payload);
            scheduleAutosave();
        },
        unselectPostId(id: PostId) {
            mutations.unselectPostId(this, id);
            scheduleAutosave();
        },
        togglePostId(payload: {id: PostId; canOpenMultiplePosts: boolean}) {
            mutations.togglePostId(this, payload);
            scheduleAutosave();
        },
        movePostLeft(id: PostId) {
            mutations.movePostLeft(this, id);
            scheduleAutosave();
        },
        movePostRight(id: PostId) {
            mutations.movePostRight(this, id);
            scheduleAutosave();
        },
        setSelectedGraphId(selectedGraphId: GraphId) {
            mutations.setSelectedGraphId(this, selectedGraphId);
            scheduleAutosave();
        },
        setSelectedSubgraphIds(selectedSubgraphIds: SubgraphId[]) {
            mutations.setSelectedSubgraphIds(this, selectedSubgraphIds);
            scheduleAutosave();
        },
        selectAllSubgraphs() {
            mutations.selectAllSubgraphs(this);
            scheduleAutosave();
        },
        toggleSubgraphId(subgraphId: SubgraphId) {
            mutations.toggleSubgraphId(this, subgraphId);
            scheduleAutosave();
        },
        setZoom(zoom: Zoom) {
            mutations.setZoom(this, zoom);
            scheduleAutosave();
        },
        makeNewGraph(newGraphName: string) {
            mutations.makeNewGraph(this, newGraphName);
            scheduleAutosave();
        },
        changeGraphName(payload: {graphId: GraphId; newGraphName: string}) {
            mutations.changeGraphName(this, payload);
            scheduleAutosave();
        },
        removeGraph(graphId: GraphId) {
            mutations.removeGraph(this, graphId);
            scheduleAutosave();
        },
        addPostToGraph(payload: {graphId: GraphId; postId: PostId}) {
            mutations.addPostToGraph(this, payload);
            scheduleAutosave();
        },
        removePostFromGraph(payload: {graphId: GraphId; postId: PostId}) {
            mutations.removePostFromGraph(this, payload);
            scheduleAutosave();
        },
        setPostPosition(payload: {postId: PostId; position: {x: number; y: number}}) {
            mutations.setPostPosition(this, payload);
            scheduleAutosave();
        },
        createPost(newPost: Post) {
            const createdPost = mutations.createPost(this, newPost);
            scheduleAutosave();
            return createdPost;
        },
        updatePostTitle(payload: {id: PostId; title: string; updatedAt: string}) {
            mutations.updatePostTitle(this, payload);
            scheduleAutosave();
        },
        updatePostBody(payload: {id: PostId; body: string; updatedAt: string}) {
            mutations.updatePostBody(this, payload);
            scheduleAutosave();
        },
        deletePost(payload: {id: PostId}) {
            mutations.deletePost(this, payload);
            scheduleAutosave();
        },
        addLink(payload: {source: PostId; target: PostId; graph: GraphId; type: LinkType; subgraphIds?: SubgraphId[]}) {
            mutations.addLink(this, payload);
            scheduleAutosave();
        },
        updateLink(link: LinkSerialised) {
            mutations.updateLink(this, link);
            scheduleAutosave();
        },
        changeLinkSource(payload: {id: LinkId; source: PostId}) {
            mutations.changeLinkSource(this, payload);
            scheduleAutosave();
        },
        changeLinkTarget(payload: {id: LinkId; target: PostId}) {
            mutations.changeLinkTarget(this, payload);
            scheduleAutosave();
        },
        setSubgraphsLinkIsIn(payload: {linkId: LinkId; subgraphsLinkIsIn: SubgraphId[]}) {
            mutations.setSubgraphsLinkIsIn(this, payload);
            scheduleAutosave();
        },
        removeLink(payload: {id: LinkId}) {
            mutations.removeLink(this, payload);
            scheduleAutosave();
        },
        makeNewSubgraph(payload: {graphId: GraphId; newSubgraphName: string}) {
            mutations.makeNewSubgraph(this, payload);
            scheduleAutosave();
        },
        changeSubgraphName(payload: {subgraphId: SubgraphId; newSubgraphName: string}) {
            mutations.changeSubgraphName(this, payload);
            scheduleAutosave();
        },
        changeSubgraphColour(payload: {subgraphId: SubgraphId; colour: string}) {
            mutations.changeSubgraphColour(this, payload);
            scheduleAutosave();
        },
        removeSubgraph(subgraphId: SubgraphId) {
            mutations.removeSubgraph(this, subgraphId);
            scheduleAutosave();
        },
        addPostToSubgraph(payload: {subgraphId: SubgraphId; postId: PostId}) {
            mutations.addPostToSubgraph(this, payload);
            scheduleAutosave();
        },
        removePostFromSubgraph(payload: {subgraphId: SubgraphId; postId: PostId}) {
            mutations.removePostFromSubgraph(this, payload);
            scheduleAutosave();
        },
        async makeNewPost(payload: {title: string; body: string; updatedAt: string; createdAt: string}) {
            const newPost = await actions.makeNewPost({
                state: this,
                commit: (mutationName: "createPost", newPostValue: Post) => {
                    if (mutationName === "createPost") {
                        mutations.createPost(this, newPostValue);
                    }
                }
            }, payload);
            scheduleAutosave();
            return newPost;
        },
    }
});

export {state, mutations, actions};

export default {
    state,
    getters: {
        ...graphs.getters,
        ...posts.getters,
        ...links.getters,
        ...subgraphs.getters,
    },
    mutations,
    actions,
};
