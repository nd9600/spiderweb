import type {
    DataModuleState,
    GraphId,
    LinkId,
    LinkType,
    PostId,
    SubgraphId
} from "@/src/@types/StoreTypes";
import {createLink, type Link} from "@/src/store/models/Link";
import {addPostToGraphState} from "./graphs";
import {nextStringId} from "./shared";
import {addPostToSubgraphState} from "./subgraphs";

export type LinkWithSubgraphId = Link & {
    subgraphId?: SubgraphId;
};

export function linkState(): Pick<DataModuleState, "links"> {
    return {
        links: {},
    };
}

export function removeLinkFromSubgraphs(state: DataModuleState, linkId: LinkId): void {
    for (const subgraph of Object.values(state.subgraphs)) {
        subgraph.links = subgraph.links.filter((id) => id !== linkId);
    }
}

function addLinkToSubgraphState(state: DataModuleState, linkId: LinkId, subgraphId: SubgraphId): void {
    const link = state.links[linkId];
    const subgraph = state.subgraphs[subgraphId];
    if (link == null || subgraph == null || subgraph.graph !== link.graph) {
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

function removeLinkState(state: DataModuleState, linkId: LinkId): void {
    removeLinkFromSubgraphs(state, linkId);
    delete state.links[linkId];
}

function getLinksInSelectedSubgraphs(state: DataModuleState): LinkWithSubgraphId[] {
    if (state.selectedSubgraphIds.length > 0) {
        let linksWithSubgraphIds: Array<{linkId: LinkId; subgraphId: SubgraphId}> = [];
        for (const selectedSubgraphId of state.selectedSubgraphIds) {
            linksWithSubgraphIds = linksWithSubgraphIds.concat(
                state.subgraphs[selectedSubgraphId].links.map((linkId) => ({
                    linkId,
                    subgraphId: selectedSubgraphId,
                }))
            );
        }

        return linksWithSubgraphIds.map(({linkId, subgraphId}) => ({
            ...state.links[linkId],
            subgraphId,
        }));
    }

    const linkToSubgraphMap: Record<LinkId, SubgraphId> = {};
    for (const subgraph of Object.values(state.subgraphs)) {
        for (const linkId of subgraph.links) {
            linkToSubgraphMap[linkId] = subgraph.id;
        }
    }

    return Object.values(state.links)
        .filter((link) => state.selectedGraphId === link.graph)
        .map((link) => {
            const subgraphId = linkToSubgraphMap[link.id];
            return subgraphId == null
                ? link
                : {
                    ...link,
                    subgraphId,
                };
        });
}

function getNeighbourIndex(linksInSelectedSubgraphs: LinkWithSubgraphId[]): Record<string, number> {
    const neighbourIndex: Record<string, number> = {};
    linksInSelectedSubgraphs.forEach((link) => {
        const source = parseInt(link.source, 10);
        const target = parseInt(link.target, 10);
        const lowerId = Math.min(source, target);
        const higherId = Math.max(source, target);
        neighbourIndex[lowerId + "," + higherId] = 1;
    });
    return neighbourIndex;
}

function arePostsNeighbours(neighbourIndex: Record<string, number>, postAId: PostId, postBId: PostId): boolean {
    const a = parseInt(postAId, 10);
    const b = parseInt(postBId, 10);
    const lowerId = Math.min(a, b);
    const higherId = Math.max(a, b);
    return typeof neighbourIndex[lowerId + "," + higherId] !== "undefined";
}

export const linkActions = {
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
        this.links[newLinkId] = createLink(newLinkId, graph, source, target, type);

        for (const subgraphId of subgraphIds) {
            addLinkToSubgraphState(this, newLinkId, subgraphId);
        }
    },
    updateLink(link: Link) {
        addPostToGraphState(this, link.graph, link.source);
        addPostToGraphState(this, link.graph, link.target);
        this.links[link.id] = link;
        ensureLinkedPostsAreInContainingSubgraphs(this, link.id);
    },
    changeLinkSource({id, source}: {id: LinkId; source: PostId}) {
        const link = this.links[id];
        if (link == null || link.source === source || link.target === source) {
            return;
        }

        addPostToGraphState(this, link.graph, source);
        link.source = source;
        ensureLinkedPostsAreInContainingSubgraphs(this, id);
    },
    changeLinkTarget({id, target}: {id: LinkId; target: PostId}) {
        const link = this.links[id];
        if (link == null || link.source === target || link.target === target) {
            return;
        }

        addPostToGraphState(this, link.graph, target);
        link.target = target;
        ensureLinkedPostsAreInContainingSubgraphs(this, id);
    },
    setSubgraphsLinkIsIn({linkId, subgraphsLinkIsIn}: {linkId: LinkId; subgraphsLinkIsIn: SubgraphId[]}) {
        const link = this.links[linkId];
        if (link == null) {
            return;
        }

        for (const subgraph of Object.values(this.subgraphs)) {
            if (subgraph.graph !== link.graph && !subgraph.links.includes(linkId)) {
                continue;
            }

            const alreadyInSubgraph = subgraph.links.includes(linkId);
            const shouldBeInSubgraph = subgraphsLinkIsIn.includes(subgraph.id);

            if (alreadyInSubgraph && !shouldBeInSubgraph) {
                subgraph.links = subgraph.links.filter((id) => id !== linkId);
            } else if (!alreadyInSubgraph && shouldBeInSubgraph) {
                addLinkToSubgraphState(this, linkId, subgraph.id);
            }
        }
    },
    removeLink({id}: {id: LinkId}) {
        removeLinkState(this, id);
    },
} satisfies ThisType<DataModuleState>;

export const linkGetters = {
    linkIds(store: DataModuleState): LinkId[] {
        return Object.keys(store.links);
    },
    linksInSelectedSubgraphs(store: DataModuleState): LinkWithSubgraphId[] {
        return getLinksInSelectedSubgraphs(store);
    },
    neighbourIndex(store: DataModuleState): Record<string, number> {
        return getNeighbourIndex(getLinksInSelectedSubgraphs(store));
    },
    isNeighbour(store: DataModuleState) {
        return (postAId: PostId, postBId: PostId): boolean => {
            return arePostsNeighbours(
                getNeighbourIndex(getLinksInSelectedSubgraphs(store)),
                postAId,
                postBId
            );
        };
    },
};
