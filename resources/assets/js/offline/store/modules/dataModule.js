import {WIDTH, HEIGHT, INITIAL_ZOOM} from "@/js/commonComponents/constants";

import graphs from "./dataModules/graphs";
import posts from "./dataModules/posts";
import links from "./dataModules/links";
import subgraphs from "./dataModules/subgraphs";


/*
We have multiple graphs
 * each graph can have multiple nodes (which are posts) and multiple (directed) links
 * each graph can be subgraphs, which are named and coloured subsets of posts and links

Posts can live independently of graphs, but links can't - they're a part of graphs

When you create a graph, it has no posts, links or subgraphs
When you delete a graph, also remove any links or subgraphs it has

When you create a post, do nothing else
When you delete a post, also remove any links that have it as a source or target, remove it from any subgraphs, and remove it from any graphs

When you add a post (to a graph), do nothing else
When you remove a post (from a graph), also remove any links that have it as a source or target, remove it from any of the graph's subgraphs

When you create a link (to a graph), if its target or source post isn't in the graph, add them to the graph
When you delete a link (from a graph), remove it from any subgraphs

When you add a post (to a subgraph), do nothing else
When you remove a post (from a subgraph), also remove any links from the subgraph that have it as a source or target

When you add a link (to a subgraph), if its target or source post isn't in the subgraph, add them to the subgraph
When you remove a link (from a subgraph), do nothing else

When you create a subgraph, it has no posts or links
When you delete a subgraph, remove it from its graph
 */
function arrayMove(array, fromIndex, toIndex) {
    let arrayCopy = array.slice(0);
    const element = array[fromIndex];
    arrayCopy.splice(fromIndex, 1);
    arrayCopy.splice(toIndex, 0, element);
    return arrayCopy;
}

const state = {
    ...graphs.state,
    ...posts.state,
    ...links.state,
    ...subgraphs.state,

    selectedPostIds: [],
    selectedGraphId: 1,
    selectedSubgraphIds: [],
    zoom: {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        scale: INITIAL_ZOOM,
    }
};

const getters = {
    ...graphs.getters,
    ...posts.getters,
    ...links.getters,
    ...subgraphs.getters,

    subgraphsInSelectedGraph(state) {
        const graph = state.graphs[state.selectedGraphId];
        return graph.subgraphs.map(id => state.subgraphs[id]);
    },

    postIdsInSelectedSubgraphs(state) {
        let postIDs = [];

        if (state.selectedSubgraphIds.length > 0) {
            for (let selectedSubgraphId of state.selectedSubgraphIds) {
                postIDs = postIDs.concat(state.subgraphs[selectedSubgraphId].nodes);
            }
        } else {
            postIDs = state.graphs[state.selectedGraphId].nodes;
        }
        const uniquePostIDs = [...new Set(postIDs.filter(id => id != null))];
        return uniquePostIDs;
    },
    postsInSelectedSubgraphs(state, getters) {
        return getters.postIdsInSelectedSubgraphs.map(id => state.posts[id]);
    },
    linksInSelectedSubgraphs(state) {
        // if we have subgraphs, add the `subgraphId` to each link object
        if (state.selectedSubgraphIds.length > 0) {
            let linkIDs = [];
            for (let selectedSubgraphId of state.selectedSubgraphIds) {
                linkIDs = linkIDs.concat(
                    state.subgraphs[selectedSubgraphId].links
                        .map(linkId => ({
                            linkId,
                            subgraphId: selectedSubgraphId
                        }))
                );
            }
            return linkIDs
                .filter(id => id != null)
                .map(({linkId, subgraphId}) => {
                    let link = JSON.parse(JSON.stringify(state.links[linkId]));
                    link.subgraphId = subgraphId;
                    return link;
                });
        } else {
            let linkToSubgraphMap = {};
            for (let subgraph of Object.values(state.subgraphs)) {
                for (let linkId of subgraph.links) {
                    linkToSubgraphMap[linkId] = subgraph.id;
                }
            }
            return Object.values(state.links)
                .filter(link => {
                    return state.selectedGraphId === link.graph;
                })
                .map(link => {
                    const subgraphId = linkToSubgraphMap[link.id];
                    if (subgraphId) {
                        link.subgraphId = subgraphId;
                    }
                    return link;
                });
        }
    },
};

const mutations = {
    ...graphs.mutations,
    ...posts.mutations,
    ...links.mutations,
    ...subgraphs.mutations,

    setState(state, newState) {
        if (
            Object.keys(newState).length === 0
            || Object.keys(newState.posts).length === 0
        ) {
            return;
        }

        state.posts = newState.posts;
        state.links = newState.links;
        state.graphs = newState.graphs;
        state.subgraphs = newState.subgraphs || {};
        state.selectedPostIds = newState.selectedPostIds || [];
        state.selectedGraphId = newState.selectedGraphId || 1;
        state.selectedSubgraphIds = newState.selectedSubgraphIds || [];
        state.zoom = newState.zoom || {
            x: WIDTH / 2,
            y: HEIGHT / 2,
            scale: INITIAL_ZOOM,
        };
    },

    setSelectedPostIds(state, selectedPostIds) {
        state.selectedPostIds = selectedPostIds;
    },
    selectPostId(state, {id, canOpenMultiplePosts}) {
        if (state.selectedPostIds.includes(id)) { // we want to move it to the front of the list
            state.selectedPostIds.splice(state.selectedPostIds.indexOf(id), 1);
        }
        
        if (canOpenMultiplePosts) {
            state.selectedPostIds.unshift(id);
        } else {
            state.selectedPostIds = [id];
        }
    },
    unselectPostId(state, id) {
        state.selectedPostIds.splice(state.selectedPostIds.indexOf(id), 1);
    },
    togglePostId(state, {id, canOpenMultiplePosts}) {
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
    movePostLeft(state, id) {
        const currentIndex = state.selectedPostIds.indexOf(id);
        const newIndex = currentIndex === 0
            ? state.selectedPostIds.length - 1
            : currentIndex - 1;
        state.selectedPostIds = arrayMove(state.selectedPostIds, currentIndex, newIndex);
    },
    movePostRight(state, id) {
        const currentIndex = state.selectedPostIds.indexOf(id);
        const newIndex = currentIndex === (state.selectedPostIds.length - 1)
            ? 0
            : currentIndex + 1;
        state.selectedPostIds = arrayMove(state.selectedPostIds, currentIndex, newIndex);
    },

    setSelectedGraphId(state, selectedGraphId) {
        state.selectedSubgraphIds = [];
        state.selectedGraphId = selectedGraphId;
    },

    setSelectedSubgraphIds(state, selectedSubgraphIds) {
        state.selectedSubgraphIds = selectedSubgraphIds;
    },
    selectAllSubgraphs(state) {
        state.selectedSubgraphIds = state.graphs[state.selectedGraphId].subgraphs;
    },
    toggleSubgraphId(state, subgraphId) {
        if (state.selectedSubgraphIds.includes(subgraphId)) {
            state.selectedSubgraphIds.splice(state.selectedSubgraphIds.indexOf(subgraphId), 1);
        } else {
            state.selectedSubgraphIds.push(subgraphId);
        }
    },

    setZoom(state, zoom) {
        state.zoom = zoom;
    }
};

const actions = {
    ...graphs.actions,
    ...posts.actions,
    ...links.actions,
    ...subgraphs.actions,
};


export default {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};
