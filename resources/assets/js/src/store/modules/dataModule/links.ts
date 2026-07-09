import type {
    DataModuleState,
    GraphId,
    LinkId,
    LinkType,
    PostId,
    SubgraphId
} from "@/src/@types/StoreTypes";
import {createLink, type Link} from "@/src/store/models/Link";
import {writeFirebaseDataModulePatch, type FirebaseUpdatePatch} from "@/src/store/remoteSync";
import {addPostToGraphState} from "./graphs";
import {addMembership, hasMembership, membershipIds, newRecordId, removeMembership} from "./shared";
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
        removeMembership(subgraph.links, linkId);
    }
}

function addLinkToSubgraphState(state: DataModuleState, linkId: LinkId, subgraphId: SubgraphId): void {
    const link = state.links[linkId];
    const subgraph = state.subgraphs[subgraphId];
    if (link == null || subgraph == null || subgraph.graph !== link.graph) {
        return;
    }

    // A subgraph link implies both endpoint posts are also visible in that subgraph.
    addPostToSubgraphState(state, subgraphId, link.source);
    addPostToSubgraphState(state, subgraphId, link.target);

    if (!hasMembership(subgraph.links, linkId)) {
        addMembership(subgraph.links, linkId);
    }
}

function ensureLinkedPostsAreInContainingSubgraphs(state: DataModuleState, linkId: LinkId): void {
    // Editing a link endpoint can introduce a new post that every containing subgraph must include.
    for (const subgraph of Object.values(state.subgraphs)) {
        if (hasMembership(subgraph.links, linkId)) {
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
            const subgraph = state.subgraphs[selectedSubgraphId];
            if (subgraph == null) {
                continue;
            }

            linksWithSubgraphIds = linksWithSubgraphIds.concat(
                membershipIds(subgraph.links).map((linkId) => ({
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
        for (const linkId of membershipIds(subgraph.links)) {
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
        neighbourIndex[neighbourKey(link.source, link.target)] = 1;
    });
    return neighbourIndex;
}

function arePostsNeighbours(neighbourIndex: Record<string, number>, postAId: PostId, postBId: PostId): boolean {
    return typeof neighbourIndex[neighbourKey(postAId, postBId)] !== "undefined";
}

function neighbourKey(postAId: PostId, postBId: PostId): string {
    return [postAId, postBId].sort().join(",");
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

        // The patch mirrors every local side effect: graph membership, link creation, and optional subgraph membership.
        const patch: FirebaseUpdatePatch = {
            [`dataModule/graphs/${graph}/nodes/${source}`]: true,
            [`dataModule/graphs/${graph}/nodes/${target}`]: true,
        };

        const newLinkId = newRecordId();
        this.links[newLinkId] = createLink(newLinkId, graph, source, target, type);
        patch[`dataModule/links/${newLinkId}`] = this.links[newLinkId];

        for (const subgraphId of subgraphIds) {
            addLinkToSubgraphState(this, newLinkId, subgraphId);
            if (this.subgraphs[subgraphId]?.graph === graph) {
                patch[`dataModule/subgraphs/${subgraphId}/nodes/${source}`] = true;
                patch[`dataModule/subgraphs/${subgraphId}/nodes/${target}`] = true;
                patch[`dataModule/subgraphs/${subgraphId}/links/${newLinkId}`] = true;
            }
        }
        writeFirebaseDataModulePatch(patch);
    },
    updateLink(link: Link) {
        addPostToGraphState(this, link.graph, link.source);
        addPostToGraphState(this, link.graph, link.target);
        this.links[link.id] = link;
        ensureLinkedPostsAreInContainingSubgraphs(this, link.id);
        // Replacing a link can also add endpoint posts to its graph/subgraphs.
        const patch: FirebaseUpdatePatch = {
            [`dataModule/graphs/${link.graph}/nodes/${link.source}`]: true,
            [`dataModule/graphs/${link.graph}/nodes/${link.target}`]: true,
            [`dataModule/links/${link.id}`]: link,
        };
        for (const subgraph of Object.values(this.subgraphs)) {
            if (hasMembership(subgraph.links, link.id) && subgraph.graph === link.graph) {
                patch[`dataModule/subgraphs/${subgraph.id}/nodes/${link.source}`] = true;
                patch[`dataModule/subgraphs/${subgraph.id}/nodes/${link.target}`] = true;
            }
        }
        writeFirebaseDataModulePatch(patch);
    },
    changeLinkSource({id, source}: {id: LinkId; source: PostId}) {
        const link = this.links[id];
        if (link == null || link.source === source || link.target === source) {
            return;
        }

        addPostToGraphState(this, link.graph, source);
        link.source = source;
        ensureLinkedPostsAreInContainingSubgraphs(this, id);
        const patch: FirebaseUpdatePatch = {
            [`dataModule/graphs/${link.graph}/nodes/${source}`]: true,
            [`dataModule/links/${id}/source`]: source,
        };
        for (const subgraph of Object.values(this.subgraphs)) {
            if (hasMembership(subgraph.links, id) && subgraph.graph === link.graph) {
                patch[`dataModule/subgraphs/${subgraph.id}/nodes/${source}`] = true;
            }
        }
        writeFirebaseDataModulePatch(patch);
    },
    changeLinkTarget({id, target}: {id: LinkId; target: PostId}) {
        const link = this.links[id];
        if (link == null || link.source === target || link.target === target) {
            return;
        }

        addPostToGraphState(this, link.graph, target);
        link.target = target;
        ensureLinkedPostsAreInContainingSubgraphs(this, id);
        const patch: FirebaseUpdatePatch = {
            [`dataModule/graphs/${link.graph}/nodes/${target}`]: true,
            [`dataModule/links/${id}/target`]: target,
        };
        for (const subgraph of Object.values(this.subgraphs)) {
            if (hasMembership(subgraph.links, id) && subgraph.graph === link.graph) {
                patch[`dataModule/subgraphs/${subgraph.id}/nodes/${target}`] = true;
            }
        }
        writeFirebaseDataModulePatch(patch);
    },
    setSubgraphsLinkIsIn({linkId, subgraphsLinkIsIn}: {linkId: LinkId; subgraphsLinkIsIn: SubgraphId[]}) {
        const link = this.links[linkId];
        if (link == null) {
            return;
        }

        // First update local membership, then build a patch from the requested membership list.
        for (const subgraph of Object.values(this.subgraphs)) {
            if (subgraph.graph !== link.graph && !hasMembership(subgraph.links, linkId)) {
                continue;
            }

            const alreadyInSubgraph = hasMembership(subgraph.links, linkId);
            const shouldBeInSubgraph = subgraphsLinkIsIn.includes(subgraph.id);

            if (alreadyInSubgraph && !shouldBeInSubgraph) {
                removeMembership(subgraph.links, linkId);
            } else if (!alreadyInSubgraph && shouldBeInSubgraph) {
                addLinkToSubgraphState(this, linkId, subgraph.id);
            }
        }
        const patch: FirebaseUpdatePatch = {};
        for (const subgraph of Object.values(this.subgraphs)) {
            if (subgraph.graph !== link.graph && !hasMembership(subgraph.links, linkId)) {
                continue;
            }

            if (subgraphsLinkIsIn.includes(subgraph.id)) {
                patch[`dataModule/subgraphs/${subgraph.id}/nodes/${link.source}`] = true;
                patch[`dataModule/subgraphs/${subgraph.id}/nodes/${link.target}`] = true;
                patch[`dataModule/subgraphs/${subgraph.id}/links/${linkId}`] = true;
            } else {
                patch[`dataModule/subgraphs/${subgraph.id}/links/${linkId}`] = null;
            }
        }
        writeFirebaseDataModulePatch(patch);
    },
    removeLink({id}: {id: LinkId}) {
        const patch: FirebaseUpdatePatch = {
            [`dataModule/links/${id}`]: null,
        };
        for (const subgraph of Object.values(this.subgraphs)) {
            if (hasMembership(subgraph.links, id)) {
                patch[`dataModule/subgraphs/${subgraph.id}/links/${id}`] = null;
            }
        }
        removeLinkState(this, id);
        writeFirebaseDataModulePatch(patch);
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
