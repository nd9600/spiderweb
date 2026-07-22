import type {
    DataModuleState,
    GraphId,
    LinkId,
    LinkType,
    PostId,
    SubgraphId
} from "@/src/@types/StoreTypes";
import {createLink, type Link} from "@/src/store/models/Link";
import {createDataModulePatch} from "./commit";
import {hasMembership, membershipIds, newRecordId} from "./shared";

export type LinkWithSubgraphId = Link & {
    subgraphId?: SubgraphId;
};

export default {
    state(): Pick<DataModuleState, "links"> {
        return {
            links: {},
        };
    },
    getters: {
        linksInSelectedSubgraphs(store: DataModuleState): LinkWithSubgraphId[] {
            if (store.selectedSubgraphIds.length > 0) {
                const selectedLinks: LinkWithSubgraphId[] = [];
                for (const selectedSubgraphId of store.selectedSubgraphIds) {
                    const subgraph = store.subgraphs[selectedSubgraphId];
                    if (subgraph == null) {
                        continue;
                    }

                    for (const linkId of membershipIds(subgraph.links)) {
                        const link = store.links[linkId];
                        if (link != null) {
                            selectedLinks.push({
                                ...link,
                                subgraphId: selectedSubgraphId,
                            });
                        }
                    }
                }

                return selectedLinks;
            }

            const linkToSubgraphMap: Partial<Record<LinkId, SubgraphId>> = {};
            for (const subgraph of Object.values(store.subgraphs)) {
                for (const linkId of membershipIds(subgraph.links)) {
                    linkToSubgraphMap[linkId] = subgraph.id;
                }
            }

            const selectedLinks: LinkWithSubgraphId[] = [];
            for (const link of Object.values(store.links)) {
                if (store.selectedGraphId !== link.graph) {
                    continue;
                }

                const subgraphId = linkToSubgraphMap[link.id];
                selectedLinks.push(
                    subgraphId == null
                        ? link
                        : {
                            ...link,
                            subgraphId,
                        }
                );
            }

            return selectedLinks;
        },
    },
    actions: {
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

            const newLinkId = newRecordId();
            const newLink = createLink(newLinkId, graph, source, target, type);
            const patch = createDataModulePatch(this)
                .addPostToGraph(graph, source)
                .addPostToGraph(graph, target)
                .setLink(newLink);

            for (const subgraphId of subgraphIds) {
                if (this.subgraphs[subgraphId]?.graph === graph) {
                    patch
                        .addPostToSubgraph(subgraphId, source)
                        .addPostToSubgraph(subgraphId, target)
                        .addLinkToSubgraph(subgraphId, newLinkId);
                }
            }

            return patch.commit();
        },
        updateLink(link: Link) {
            const patch = createDataModulePatch(this)
                .addPostToGraph(link.graph, link.source)
                .addPostToGraph(link.graph, link.target)
                .setLink(link);
            for (const subgraph of Object.values(this.subgraphs)) {
                if (hasMembership(subgraph.links, link.id) && subgraph.graph === link.graph) {
                    patch
                        .addPostToSubgraph(subgraph.id, link.source)
                        .addPostToSubgraph(subgraph.id, link.target);
                }
            }

            return patch.commit();
        },
        changeLinkSource({id, source}: {id: LinkId; source: PostId}) {
            const link = this.links[id];
            if (link == null || link.source === source || link.target === source) {
                return;
            }

            const patch = createDataModulePatch(this)
                .addPostToGraph(link.graph, source)
                .setLinkSource(id, source);
            for (const subgraph of Object.values(this.subgraphs)) {
                if (hasMembership(subgraph.links, id) && subgraph.graph === link.graph) {
                    patch.addPostToSubgraph(subgraph.id, source);
                }
            }

            return patch.commit();
        },
        changeLinkTarget({id, target}: {id: LinkId; target: PostId}) {
            const link = this.links[id];
            if (link == null || link.source === target || link.target === target) {
                return;
            }

            const patch = createDataModulePatch(this)
                .addPostToGraph(link.graph, target)
                .setLinkTarget(id, target);
            for (const subgraph of Object.values(this.subgraphs)) {
                if (hasMembership(subgraph.links, id) && subgraph.graph === link.graph) {
                    patch.addPostToSubgraph(subgraph.id, target);
                }
            }

            return patch.commit();
        },
        setSubgraphsLinkIsIn({linkId, subgraphsLinkIsIn}: {linkId: LinkId; subgraphsLinkIsIn: SubgraphId[]}) {
            const link = this.links[linkId];
            if (link == null) {
                return;
            }

            const patch = createDataModulePatch(this);
            for (const subgraph of Object.values(this.subgraphs)) {
                if (subgraph.graph !== link.graph && !hasMembership(subgraph.links, linkId)) {
                    continue;
                }

                if (subgraphsLinkIsIn.includes(subgraph.id)) {
                    if (subgraph.graph === link.graph) {
                        patch
                            .addPostToSubgraph(subgraph.id, link.source)
                            .addPostToSubgraph(subgraph.id, link.target)
                            .addLinkToSubgraph(subgraph.id, linkId);
                    }
                } else {
                    patch.removeLinkFromSubgraph(subgraph.id, linkId);
                }
            }

            return patch.commit();
        },
        removeLink({id}: {id: LinkId}) {
            const patch = createDataModulePatch(this)
                .deleteLink(id);
            for (const subgraph of Object.values(this.subgraphs)) {
                if (hasMembership(subgraph.links, id)) {
                    patch.removeLinkFromSubgraph(subgraph.id, id);
                }
            }

            return patch.commit();
        },
    } satisfies ThisType<DataModuleState>,
};
