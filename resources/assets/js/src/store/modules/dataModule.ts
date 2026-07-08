import {defineStore} from "pinia";
import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/components/constants";
import type {
    DataModuleState,
    GraphId,
    LinkId,
    LinksMap,
    LinkType,
    NodePosition,
    NodePositionsMap,
    PostId,
    SubgraphId,
    Zoom
} from "@/src/@types/StoreTypes";
import Graph, {type GraphSerialised} from "@/src/store/classes/Graph";
import Link, {type LinkSerialised} from "@/src/store/classes/Link";
import Post, {type PostSerialised} from "@/src/store/classes/Post";
import Subgraph, {type SubgraphSerialised} from "@/src/store/classes/Subgraph";
import {useRootStore} from "./rootStore";

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

type LinkWithSubgraphId = LinkSerialised & {
    subgraphId?: SubgraphId;
};

interface MakeNewPostPayload {
    title: string;
    body: string;
    updatedAt: string;
    createdAt: string;
}

function initialState(): DataModuleState {
    return {
        graphs: {
            "1": {
                id: "1",
                name: "default",
                nodes: [],
                nodePositions: {},
                subgraphs: [],
            },
        },
        posts: {},
        links: {},
        subgraphs: {},
        selectedPostIds: [],
        selectedGraphId: "1",
        selectedSubgraphIds: [],
        zoom: {
            x: WIDTH / 2,
            y: HEIGHT / 2,
            scale: INITIAL_ZOOM,
        },
    };
}

function objectMap<T, S>(f: (o: T) => S, o: Record<string, T>): Record<string, S> {
    return Object.assign({}, ...Object.keys(o).map((k) => ({[k]: f(o[k])})));
}

function nextStringId(records: Record<string, unknown>): string {
    const existingIds = Object.keys(records).map((id) => parseInt(id, 10));
    const highestId = existingIds.length === 0
        ? 0
        : Math.max(...existingIds);
    return String(highestId + 1);
}

function stringToColour(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    let colour = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        colour += ("00" + value.toString(16)).slice(-2);
    }
    return colour;
}

function arrayMove<T>(array: Array<T>, fromIndex: number, toIndex: number): Array<T> {
    const arrayCopy = array.slice(0);
    const element = array[fromIndex];
    arrayCopy.splice(fromIndex, 1);
    arrayCopy.splice(toIndex, 0, element);
    return arrayCopy;
}

function addPostToGraphState(state: DataModuleState, graphId: GraphId, postId: PostId): void {
    const graph = state.graphs[graphId];
    if (graph == null || graph.nodes.includes(postId)) {
        return;
    }

    graph.nodes.push(postId);
}

function getSubgraphGraphId(state: DataModuleState, subgraphId: SubgraphId): Nullable<GraphId> {
    for (const graph of Object.values(state.graphs)) {
        if (graph.subgraphs.includes(subgraphId)) {
            return graph.id;
        }
    }

    return null;
}

function addPostToSubgraphState(state: DataModuleState, subgraphId: SubgraphId, postId: PostId): void {
    const subgraph = state.subgraphs[subgraphId];
    if (subgraph == null) {
        return;
    }

    const graphId = getSubgraphGraphId(state, subgraphId) ?? state.selectedGraphId;
    if (graphId != null) {
        addPostToGraphState(state, graphId, postId);
    }

    if (!subgraph.nodes.includes(postId)) {
        subgraph.nodes.push(postId);
    }
}

function removeLinkFromSubgraphs(state: DataModuleState, linkId: LinkId): void {
    for (const subgraph of Object.values(state.subgraphs)) {
        subgraph.links = subgraph.links.filter((id) => id !== linkId);
    }
}

function removeLinksWhere(state: DataModuleState, shouldRemoveLink: (link: LinkSerialised) => boolean): void {
    const linksAfterRemoval: LinksMap = {};
    for (const link of Object.values(state.links)) {
        if (shouldRemoveLink(link)) {
            removeLinkFromSubgraphs(state, link.id);
            continue;
        }

        linksAfterRemoval[link.id] = link;
    }

    state.links = linksAfterRemoval;
}

function removePostPositionFromGraph(graph: GraphSerialised, postId: PostId): void {
    const nodePositions: NodePositionsMap = {};
    for (const [positionPostId, position] of Object.entries(graph.nodePositions)) {
        if (positionPostId !== postId) {
            nodePositions[positionPostId] = position;
        }
    }

    graph.nodePositions = nodePositions;
}

function removePostFromGraphState(state: DataModuleState, graphId: GraphId, postId: PostId): void {
    const graph = state.graphs[graphId];
    if (graph == null) {
        return;
    }

    removeLinksWhere(
        state,
        (link) => link.graph === graphId && (link.source === postId || link.target === postId)
    );

    for (const subgraphId of graph.subgraphs) {
        const subgraph = state.subgraphs[subgraphId];
        if (subgraph != null) {
            subgraph.nodes = subgraph.nodes.filter((id) => id !== postId);
        }
    }

    removePostPositionFromGraph(graph, postId);
    graph.nodes = graph.nodes.filter((id) => id !== postId);
}

function removePostFromSubgraphState(state: DataModuleState, subgraphId: SubgraphId, postId: PostId): void {
    const subgraph = state.subgraphs[subgraphId];
    if (subgraph == null) {
        return;
    }

    subgraph.links = subgraph.links.filter((linkId) => {
        const link = state.links[linkId];
        return link == null || (link.source !== postId && link.target !== postId);
    });
    subgraph.nodes = subgraph.nodes.filter((id) => id !== postId);
}

function removeLinkState(state: DataModuleState, linkId: LinkId): void {
    removeLinkFromSubgraphs(state, linkId);
    delete state.links[linkId];
}

function addLinkToSubgraphState(state: DataModuleState, linkId: LinkId, subgraphId: SubgraphId): void {
    const link = state.links[linkId];
    const subgraph = state.subgraphs[subgraphId];
    if (link == null || subgraph == null) {
        return;
    }

    addPostToSubgraphState(state, subgraphId, link.source);
    addPostToSubgraphState(state, subgraphId, link.target);

    if (!subgraph.links.includes(linkId)) {
        subgraph.links.push(linkId);
    }
}

function ensureLinkedPostsAreInContainingSubgraphs(state: DataModuleState, linkId: LinkId): void {
    for (const subgraph of Object.values(state.subgraphs)) {
        if (subgraph.links.includes(linkId)) {
            addLinkToSubgraphState(state, linkId, subgraph.id);
        }
    }
}

function deletePostState(state: DataModuleState, postId: PostId): void {
    state.selectedPostIds = state.selectedPostIds.filter((id) => id !== postId);

    removeLinksWhere(
        state,
        (link) => link.source === postId || link.target === postId
    );

    for (const graph of Object.values(state.graphs)) {
        graph.nodes = graph.nodes.filter((id) => id !== postId);
        removePostPositionFromGraph(graph, postId);
    }

    for (const subgraph of Object.values(state.subgraphs)) {
        subgraph.nodes = subgraph.nodes.filter((id) => id !== postId);
    }

    delete state.posts[postId];
}

function scheduleAutosave(): void {
    if (typeof localStorage === "undefined") {
        return;
    }

    useRootStore().scheduleAutosave();
}

export const useDataStore = defineStore("dataModule", {
    state: (): DataModuleState => initialState(),
    getters: {
        postIds(store): PostId[] {
            return Object.keys(store.posts);
        },
        unattachedPosts(store): PostSerialised[] {
            const attachedPostIds = new Set<PostId>();
            for (const graph of Object.values(store.graphs)) {
                graph.nodes.forEach((postId) => attachedPostIds.add(postId));
            }

            return Object.keys(store.posts)
                .filter((id) => !attachedPostIds.has(id))
                .map((id) => store.posts[id]);
        },
        titleOrBody(store): (postId: PostId) => string {
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
        neighbourIndex(): Record<string, number> {
            const neighbourIndex: Record<string, number> = {};
            this.linksInSelectedSubgraphs.forEach((link) => {
                const source = parseInt(link.source, 10);
                const target = parseInt(link.target, 10);
                const lowerId = Math.min(source, target);
                const higherId = Math.max(source, target);
                neighbourIndex[lowerId + "," + higherId] = 1;
            });
            return neighbourIndex;
        },
        isNeighbour(): (postAId: PostId, postBId: PostId) => boolean {
            return (postAId: PostId, postBId: PostId): boolean => {
                const a = parseInt(postAId, 10);
                const b = parseInt(postBId, 10);
                const lowerId = Math.min(a, b);
                const higherId = Math.max(a, b);
                return typeof this.neighbourIndex[lowerId + "," + higherId] !== "undefined";
            };
        },
        postIdsThatLinkToPost(store): (postId: PostId) => {from: Record<LinkId, PostId>; to: Record<LinkId, PostId>} {
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
        linkedSubgraphs(store): (postId: PostId) => SubgraphId[] {
            return (postId: PostId): SubgraphId[] => {
                const linkedSubgraphs: SubgraphId[] = [];

                for (const subgraph of Object.values(store.subgraphs)) {
                    if (subgraph.nodes.includes(postId)) {
                        linkedSubgraphs.push(subgraph.id);
                    }
                }

                return linkedSubgraphs;
            };
        },
        linkIds(store): LinkId[] {
            return Object.keys(store.links);
        },
        subgraphsLinkIsIn(store): (linkId: LinkId) => SubgraphId[] {
            return (linkId: LinkId): SubgraphId[] => {
                const subgraphsLinkIsIn: SubgraphId[] = [];

                for (const subgraph of Object.values(store.subgraphs)) {
                    if (subgraph.links.includes(linkId)) {
                        subgraphsLinkIsIn.push(subgraph.id);
                    }
                }

                return subgraphsLinkIsIn;
            };
        },
        subgraphColour(store): (subgraphId: Nullable<SubgraphId>) => string {
            return (subgraphId: Nullable<SubgraphId>): string => {
                if (subgraphId == null) {
                    return "#000000";
                }

                return store.subgraphs[subgraphId]?.colour
                    || stringToColour(`${String(subgraphId)}salt and pepper are good for hashes`);
            };
        },
        subgraphsInSelectedGraph(store): SubgraphSerialised[] {
            const graphId = store.selectedGraphId;
            if (graphId == null || store.graphs[graphId] == null) {
                return [];
            }

            return store.graphs[graphId].subgraphs.map((id) => store.subgraphs[id]);
        },
        postIdsInSelectedSubgraphs(store): PostId[] {
            let postIds: PostId[] = [];
            if (store.selectedSubgraphIds.length > 0) {
                for (const selectedSubgraphId of store.selectedSubgraphIds) {
                    postIds = postIds.concat(store.subgraphs[selectedSubgraphId].nodes);
                }
            } else if (store.selectedGraphId != null && store.graphs[store.selectedGraphId] != null) {
                postIds = store.graphs[store.selectedGraphId].nodes;
            }

            return [...new Set(postIds.filter((id): id is PostId => id != null))];
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
                let linksWithSubgraphIds: Array<{linkId: LinkId; subgraphId: SubgraphId}> = [];
                for (const selectedSubgraphId of store.selectedSubgraphIds) {
                    linksWithSubgraphIds = linksWithSubgraphIds.concat(
                        store.subgraphs[selectedSubgraphId].links.map((linkId) => ({
                            linkId,
                            subgraphId: selectedSubgraphId,
                        }))
                    );
                }

                return linksWithSubgraphIds.map(({linkId, subgraphId}) => ({
                    ...store.links[linkId],
                    subgraphId,
                }));
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
                    return subgraphId == null
                        ? link
                        : {
                            ...link,
                            subgraphId,
                        };
                });
        },
    },
    actions: {
        setState(newState: DataModuleStateSerialised) {
            if (
                Object.keys(newState).length === 0
                || Object.keys(newState.posts).length === 0
            ) {
                return;
            }

            this.graphs = objectMap((graph) => Graph.unserialise(graph).serialise(), newState.graphs);
            this.posts = objectMap((post) => Post.unserialise(post).serialise(), newState.posts);
            this.links = objectMap((link) => Link.unserialise(link).serialise(), newState.links);
            this.subgraphs = newState.subgraphs == null
                ? {}
                : objectMap((subgraph) => Subgraph.unserialise(subgraph).serialise(), newState.subgraphs);

            this.selectedPostIds = newState.selectedPostIds.map(String) || [];
            this.selectedGraphId = String(newState.selectedGraphId) || "1";
            this.selectedSubgraphIds = newState.selectedSubgraphIds.map(String) || [];

            this.zoom = newState.zoom || {
                x: WIDTH / 2,
                y: HEIGHT / 2,
                scale: INITIAL_ZOOM,
            };
        },
        setSelectedPostIds(selectedPostIds: PostId[]) {
            this.selectedPostIds = selectedPostIds;
            scheduleAutosave();
        },
        selectPostId({id, canOpenMultiplePosts}: {id: PostId; canOpenMultiplePosts: boolean}) {
            this.selectedPostIds = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);

            if (canOpenMultiplePosts) {
                this.selectedPostIds.unshift(id);
            } else {
                this.selectedPostIds = [id];
            }
            scheduleAutosave();
        },
        unselectPostId(id: PostId) {
            this.selectedPostIds = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);
            scheduleAutosave();
        },
        togglePostId({id, canOpenMultiplePosts}: {id: PostId; canOpenMultiplePosts: boolean}) {
            if (this.selectedPostIds.includes(id)) {
                this.selectedPostIds = this.selectedPostIds.filter((selectedPostId) => selectedPostId !== id);
            } else if (canOpenMultiplePosts) {
                this.selectedPostIds.unshift(id);
            } else {
                this.selectedPostIds = [id];
            }
            scheduleAutosave();
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
            scheduleAutosave();
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
            scheduleAutosave();
        },
        setSelectedGraphId(selectedGraphId: GraphId) {
            this.selectedSubgraphIds = [];
            this.selectedGraphId = selectedGraphId;
            scheduleAutosave();
        },
        setSelectedSubgraphIds(selectedSubgraphIds: SubgraphId[]) {
            this.selectedSubgraphIds = selectedSubgraphIds;
            scheduleAutosave();
        },
        selectAllSubgraphs() {
            if (this.selectedGraphId == null || this.graphs[this.selectedGraphId] == null) {
                this.selectedSubgraphIds = [];
            } else {
                this.selectedSubgraphIds = this.graphs[this.selectedGraphId].subgraphs;
            }
            scheduleAutosave();
        },
        toggleSubgraphId(subgraphId: SubgraphId) {
            if (this.selectedSubgraphIds.includes(subgraphId)) {
                this.selectedSubgraphIds = this.selectedSubgraphIds.filter((selectedSubgraphId) => selectedSubgraphId !== subgraphId);
            } else {
                this.selectedSubgraphIds.push(subgraphId);
            }
            scheduleAutosave();
        },
        setZoom(zoom: Zoom) {
            this.zoom = zoom;
            scheduleAutosave();
        },
        makeNewGraph(newGraphName: string) {
            if (newGraphName.trim().length === 0) {
                return;
            }

            const existingGraphNames = Object.values(this.graphs).map((graph) => graph.name);
            if (existingGraphNames.includes(newGraphName)) {
                alert("You're trying to add a graph that already exists, choose a different name");
                return;
            }

            const newGraphId = nextStringId(this.graphs);
            this.graphs[newGraphId] = new Graph(newGraphId, newGraphName, [], {}, []).serialise();
            scheduleAutosave();
        },
        changeGraphName({graphId, newGraphName}: {graphId: GraphId; newGraphName: string}) {
            this.graphs[graphId].name = newGraphName;
            scheduleAutosave();
        },
        removeGraph(graphId: GraphId) {
            const graph = this.graphs[graphId];
            if (graph == null) {
                return;
            }

            if (this.selectedGraphId === graphId) {
                this.selectedGraphId = null;
            }

            this.selectedSubgraphIds = this.selectedSubgraphIds
                .filter((selectedSubgraphId) => !graph.subgraphs.includes(selectedSubgraphId));

            for (const subgraphId of graph.subgraphs) {
                delete this.subgraphs[subgraphId];
            }

            for (const link of Object.values(this.links)) {
                if (link.graph === graphId) {
                    delete this.links[link.id];
                }
            }

            delete this.graphs[graphId];
            scheduleAutosave();
        },
        addPostToGraph({graphId, postId}: {graphId: GraphId; postId: PostId}) {
            addPostToGraphState(this, graphId, postId);
            scheduleAutosave();
        },
        removePostFromGraph({graphId, postId}: {graphId: GraphId; postId: PostId}) {
            removePostFromGraphState(this, graphId, postId);
            scheduleAutosave();
        },
        setPostPosition({postId, position}: {postId: PostId; position: NodePosition}) {
            if (this.selectedGraphId == null) {
                return;
            }

            this.graphs[this.selectedGraphId].nodePositions[postId] = position;
            scheduleAutosave();
        },
        updatePostTitle({id, title, updatedAt}: {id: PostId; title: string; updatedAt: string}) {
            this.posts[id].title = title;
            this.posts[id].updatedAt = updatedAt;
            scheduleAutosave();
        },
        updatePostBody({id, body, updatedAt}: {id: PostId; body: string; updatedAt: string}) {
            this.posts[id].body = body;
            this.posts[id].updatedAt = updatedAt;
            scheduleAutosave();
        },
        deletePost({id}: {id: PostId}) {
            deletePostState(this, id);
            scheduleAutosave();
        },
        addLink({source, target, graph, type = "reply", subgraphIds = []}: {source: PostId; target: PostId; graph: GraphId; type: LinkType; subgraphIds?: SubgraphId[]}) {
            const linkAlreadyExists = Object.values(this.links)
                .some((link) => {
                    return (
                        link.graph === graph
                        && link.source === source
                        && link.target === target
                        && link.type === type
                    );
                });
            if (linkAlreadyExists) {
                alert("This link already exists");
                return;
            }

            addPostToGraphState(this, graph, source);
            addPostToGraphState(this, graph, target);

            const newLinkId = nextStringId(this.links);
            this.links[newLinkId] = new Link(newLinkId, graph, source, target, type).serialise();

            for (const subgraphId of subgraphIds) {
                addLinkToSubgraphState(this, newLinkId, subgraphId);
            }

            scheduleAutosave();
        },
        updateLink(link: LinkSerialised) {
            addPostToGraphState(this, link.graph, link.source);
            addPostToGraphState(this, link.graph, link.target);
            this.links[link.id] = link;
            ensureLinkedPostsAreInContainingSubgraphs(this, link.id);
            scheduleAutosave();
        },
        changeLinkSource({id, source}: {id: LinkId; source: PostId}) {
            const link = this.links[id];
            if (link == null || link.source === source || link.target === source) {
                return;
            }

            addPostToGraphState(this, link.graph, source);
            link.source = source;
            ensureLinkedPostsAreInContainingSubgraphs(this, id);
            scheduleAutosave();
        },
        changeLinkTarget({id, target}: {id: LinkId; target: PostId}) {
            const link = this.links[id];
            if (link == null || link.source === target || link.target === target) {
                return;
            }

            addPostToGraphState(this, link.graph, target);
            link.target = target;
            ensureLinkedPostsAreInContainingSubgraphs(this, id);
            scheduleAutosave();
        },
        setSubgraphsLinkIsIn({linkId, subgraphsLinkIsIn}: {linkId: LinkId; subgraphsLinkIsIn: SubgraphId[]}) {
            for (const subgraphId of Object.keys(this.subgraphs)) {
                const subgraph = this.subgraphs[subgraphId];
                const alreadyInSubgraph = subgraph.links.includes(linkId);
                const shouldBeInSubgraph = subgraphsLinkIsIn.includes(subgraphId);

                if (alreadyInSubgraph && !shouldBeInSubgraph) {
                    subgraph.links = subgraph.links.filter((id) => id !== linkId);
                } else if (!alreadyInSubgraph && shouldBeInSubgraph) {
                    addLinkToSubgraphState(this, linkId, subgraphId);
                }
            }
            scheduleAutosave();
        },
        removeLink({id}: {id: LinkId}) {
            removeLinkState(this, id);
            scheduleAutosave();
        },
        makeNewSubgraph({graphId, newSubgraphName}: {graphId: GraphId; newSubgraphName: string}) {
            if (newSubgraphName.trim().length === 0) {
                return;
            }

            const existingSubgraphNames = Object.values(this.subgraphs).map((subgraph) => subgraph.name);
            if (existingSubgraphNames.includes(newSubgraphName)) {
                alert("You're trying to make a subgraph that already exists, choose a different name");
                return;
            }

            const newSubgraphId = nextStringId(this.subgraphs);
            this.subgraphs[newSubgraphId] = new Subgraph(newSubgraphId, newSubgraphName, [], []).serialise();
            this.graphs[graphId].subgraphs.push(newSubgraphId);
            scheduleAutosave();
        },
        changeSubgraphName({subgraphId, newSubgraphName}: {subgraphId: SubgraphId; newSubgraphName: string}) {
            this.subgraphs[subgraphId].name = newSubgraphName;
            scheduleAutosave();
        },
        changeSubgraphColour({subgraphId, colour}: {subgraphId: SubgraphId; colour: string}) {
            this.subgraphs[subgraphId].colour = colour;
            scheduleAutosave();
        },
        removeSubgraph(subgraphId: SubgraphId) {
            this.selectedSubgraphIds = this.selectedSubgraphIds
                .filter((selectedSubgraphId) => selectedSubgraphId !== subgraphId);

            const graphId = getSubgraphGraphId(this, subgraphId);
            if (graphId != null) {
                this.graphs[graphId].subgraphs = this.graphs[graphId].subgraphs
                    .filter((id) => id !== subgraphId);
            }

            delete this.subgraphs[subgraphId];
            scheduleAutosave();
        },
        addPostToSubgraph({subgraphId, postId}: {subgraphId: SubgraphId; postId: PostId}) {
            addPostToSubgraphState(this, subgraphId, postId);
            scheduleAutosave();
        },
        removePostFromSubgraph({subgraphId, postId}: {subgraphId: SubgraphId; postId: PostId}) {
            removePostFromSubgraphState(this, subgraphId, postId);
            scheduleAutosave();
        },
        makeNewPost({title, body, updatedAt, createdAt}: MakeNewPostPayload) {
            const newPostId = nextStringId(this.posts);
            const newPost = new Post(newPostId, title, body, createdAt, updatedAt);
            this.posts[newPostId] = newPost.serialise();
            scheduleAutosave();
            return newPost;
        },
    },
});
