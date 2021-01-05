import Vue from "vue";
import {DataModuleState, GraphId, LinkId, PostId, SubgraphId} from "@/src/@types/StoreTypes";
import Link from "@/src/offline/store/classes/Link";

const state = {
    links: {},
};

const getters = {
    linkIds(state: DataModuleState) {
        return Object.keys(state.links);
    },

    subgraphsLinkIsIn: (state: DataModuleState) => (linkId: LinkId) => {
        let subgraphsLinkIsIn = [];

        for (let subgraph of Object.values(state.subgraphs)) {
            if (subgraph.links.includes(linkId)) {
                subgraphsLinkIsIn.push(subgraph.id);
            }
        }
        return subgraphsLinkIsIn;
    }
};

const mutations = {
    addLink(state: DataModuleState, {source, target, graph, type = "reply", subgraphIds = []}: {source: PostId, target: PostId, graph: GraphId, type: string, subgraphIds?: SubgraphId[]}) {
        const existingLinkIds = Object.keys(state.links);
        const highestLinkId = existingLinkIds.length === 0
            ? 0
            : (
                Math.max(
                    ...existingLinkIds
                        .map(id => parseInt(id, 10))
                )
            );
        const newLinkId = String(highestLinkId + 1);

        const linkAlreadyExists = Object.values(state.links)
            .filter(
                link => {
                    return (
                        link.graph === graph
                        && link.source === source
                        && link.target === target
                        && link.type === type
                    );
                })
            .length > 0;
        if (linkAlreadyExists) {
            alert("This link already exists");
            return;
        }

        // add source and/or target posts to the graph, if they're not there already
        const postIdsAlreadyInGraph = state.graphs[graph].nodes;
        if (!postIdsAlreadyInGraph.includes(source)) {
            state.graphs[graph].nodes.push(source);
        }
        if (!postIdsAlreadyInGraph.includes(target)) {
            state.graphs[graph].nodes.push(target);
        }

        const link = new Link(newLinkId, graph, source, target, type);
        Vue.set(state.links, newLinkId, link.serialise());

        if (subgraphIds.length > 0) {
            for (const subgraphId of subgraphIds) {
                // add source and/or target posts to the subgraph, if they're not there already
                let postIdsAlreadyInSubgraph = state.subgraphs[subgraphId].nodes;
                if (!postIdsAlreadyInSubgraph.includes(source)) {
                    state.subgraphs[subgraphId].nodes.push(source);
                }
                if (!postIdsAlreadyInSubgraph.includes(target)) {
                    state.subgraphs[subgraphId].nodes.push(target);
                }

                state.subgraphs[subgraphId].links.push(newLinkId);
            }
        }
    },
    updateLink(state: DataModuleState, link: Link) {
        // add source and/or target posts to the graph, if they're not there already
        const postIdsAlreadyInGraph = state.graphs[link.graph].nodes;
        if (!postIdsAlreadyInGraph.includes(link.source)) {
            state.graphs[link.graph].nodes.push(link.source);
        }
        if (!postIdsAlreadyInGraph.includes(link.target)) {
            state.graphs[link.graph].nodes.push(link.target);
        }

        Vue.set(state.links, link.id, link);
    },
    changeLinkSource(state: DataModuleState, {id, source}: {id: LinkId, source: PostId}) {
        let link = JSON.parse(JSON.stringify(state.links[id]));
        if (
            link.source === source
            || link.target === source
        ) {
            return; // you can't link a post to itself
        }

        const postIdsAlreadyInGraph = state.graphs[link.graph].nodes;
        if (!postIdsAlreadyInGraph.includes(source)) {
            state.graphs[link.graph].nodes.push(source);
        }
        link.source = source;

        Vue.set(state.links, id, link);
    },
    changeLinkTarget(state: DataModuleState, {id, target}: {id: LinkId, target: PostId}) {
        let link = JSON.parse(JSON.stringify(state.links[id]));
        if (
            link.source === target
            || link.target === target
        ) {
            return; // you can't link a post to itself
        }

        const postIdsAlreadyInGraph = state.graphs[link.graph].nodes;
        if (!postIdsAlreadyInGraph.includes(target)) {
            state.graphs[link.graph].nodes.push(target);
        }
        link.target = target;

        Vue.set(state.links, id, link);
    },
    setSubgraphsLinkIsIn(state: DataModuleState, {linkId, subgraphsLinkIsIn}: {linkId: LinkId, subgraphsLinkIsIn: SubgraphId[]}) {
        for (const subgraphId of Object.keys(state.subgraphs)) {
            const indexOfLink = state.subgraphs[subgraphId].links.indexOf(linkId);
            const alreadyInSubgraph = indexOfLink >= 0;
            const shouldBeInSubgraph = subgraphsLinkIsIn.includes(subgraphId);

            if (alreadyInSubgraph && !shouldBeInSubgraph) {
                state.subgraphs[subgraphId].links.splice(indexOfLink, 1);
            } else if (!alreadyInSubgraph && shouldBeInSubgraph) {
                // add source and/or target posts to the subgraph, if they're not there already
                const link = state.links[linkId];
                const postIdsAlreadyInSubgraph = state.subgraphs[subgraphId].nodes;
                if (!postIdsAlreadyInSubgraph.includes(link.source)) {
                    state.subgraphs[subgraphId].nodes.push(link.source);
                }
                if (!postIdsAlreadyInSubgraph.includes(link.target)) {
                    state.subgraphs[subgraphId].nodes.push(link.target);
                }

                state.subgraphs[subgraphId].links.push(linkId);
            }
        }
    },

    removeLink(state: DataModuleState, {id}: {id: LinkId}) {
        // we also need to remove it from any subgraphs
        for (const subgraphId of Object.keys(state.subgraphs)) {
            const indexOfLink = state.subgraphs[subgraphId].links.indexOf(id);
            const alreadyInSubgraph = indexOfLink >= 0;
            if (alreadyInSubgraph) {
                state.subgraphs[subgraphId].links.splice(indexOfLink, 1);
            }
        }

        Vue.delete(state.links, id);
    },
};

const actions = {};

export default {
    state,
    getters,
    mutations,
    actions
};
