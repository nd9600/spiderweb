import type {
    GraphId,
    GraphsMap,
    LinkId,
    LinksMap,
    PostId,
    PostsMap,
    SubgraphId,
    SubgraphsMap,
} from "@/src/@types/StoreTypes";
import type {PostSerialised} from "@/src/offline/store/classes/Post";
import type {LinkSerialised} from "@/src/offline/store/classes/Link";
import type {SubgraphSerialised} from "@/src/offline/store/classes/Subgraph";

export type LinkWithSubgraphId = LinkSerialised & {
    subgraphId?: SubgraphId;
};

export function getPostIds(posts: PostsMap): PostId[] {
    return Object.keys(posts);
}

export function getLinkIds(links: LinksMap): LinkId[] {
    return Object.keys(links);
}

export function getUnattachedPosts(graphs: GraphsMap, posts: PostsMap): PostSerialised[] {
    let attachedPostIDs: PostId[] = [];
    for (const graphObj of Object.values(graphs)) {
        attachedPostIDs = attachedPostIDs.concat(graphObj.nodes);
    }
    const uniqueAttachedPostIDs = [...new Set(attachedPostIDs)];
    return Object.keys(posts)
        .filter((id) => !uniqueAttachedPostIDs.includes(id))
        .map((id) => posts[id]);
}

export function getTitleOrBody(posts: PostsMap, postId: PostId): string {
    const MAX_BODY_LENGTH = 30;
    const post = posts[postId];
    const possibleTitle = post.title.split("\n")[0].trim();
    if (possibleTitle.length > 0) {
        return possibleTitle;
    }

    const strToReturn = post.body.split("\n")[0].trim();
    return strToReturn.length > MAX_BODY_LENGTH
        ? strToReturn.substring(0, MAX_BODY_LENGTH) + ".."
        : strToReturn;
}

export function getPostIdsThatLinkToPost(links: LinksMap, postId: PostId): {from: Record<LinkId, PostId>; to: Record<LinkId, PostId>} {
    const fromPostIds: Record<LinkId, PostId> = {};
    const toPostIds: Record<LinkId, PostId> = {};

    Object.values(links).forEach((link) => {
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
}

export function getLinkedSubgraphs(subgraphs: SubgraphsMap, postId: PostId): SubgraphId[] {
    const linkedSubgraphs: SubgraphId[] = [];

    for (const subgraph of Object.values(subgraphs)) {
        if (subgraph.nodes.includes(postId)) {
            linkedSubgraphs.push(subgraph.id);
        }
    }
    return linkedSubgraphs;
}

export function getSubgraphsInSelectedGraph(
    graphs: GraphsMap,
    subgraphs: SubgraphsMap,
    selectedGraphId: Nullable<GraphId>
): SubgraphSerialised[] {
    if (selectedGraphId == null || graphs[selectedGraphId] == null) {
        return [];
    }

    return graphs[selectedGraphId].subgraphs.map((id) => subgraphs[id]);
}

export function getPostIdsInSelectedSubgraphs(
    graphs: GraphsMap,
    subgraphs: SubgraphsMap,
    selectedGraphId: Nullable<GraphId>,
    selectedSubgraphIds: SubgraphId[]
): PostId[] {
    let postIDs: PostId[] = [];

    if (selectedSubgraphIds.length > 0) {
        for (const selectedSubgraphId of selectedSubgraphIds) {
            postIDs = postIDs.concat(subgraphs[selectedSubgraphId].nodes);
        }
    } else if (selectedGraphId != null && graphs[selectedGraphId] != null) {
        postIDs = graphs[selectedGraphId].nodes;
    }

    return [...new Set(postIDs.filter((id): id is PostId => id != null))];
}

export function getPostsInSelectedSubgraphs(
    graphs: GraphsMap,
    posts: PostsMap,
    subgraphs: SubgraphsMap,
    selectedGraphId: Nullable<GraphId>,
    selectedSubgraphIds: SubgraphId[]
): PostSerialised[] {
    return getPostIdsInSelectedSubgraphs(graphs, subgraphs, selectedGraphId, selectedSubgraphIds)
        .map((id) => posts[id]);
}

export function getLinksInSelectedSubgraphs(
    links: LinksMap,
    subgraphs: SubgraphsMap,
    selectedGraphId: Nullable<GraphId>,
    selectedSubgraphIds: SubgraphId[]
): LinkWithSubgraphId[] {
    if (selectedSubgraphIds.length > 0) {
        let linksWithSubgraphIDs: Array<{linkId: LinkId; subgraphId: SubgraphId}> = [];
        for (const selectedSubgraphId of selectedSubgraphIds) {
            linksWithSubgraphIDs = linksWithSubgraphIDs.concat(
                subgraphs[selectedSubgraphId].links.map((linkId) => ({
                    linkId,
                    subgraphId: selectedSubgraphId,
                }))
            );
        }

        return linksWithSubgraphIDs.map(({linkId, subgraphId}) => ({
            ...links[linkId],
            subgraphId,
        }));
    }

    const linkToSubgraphMap: Record<LinkId, SubgraphId> = {};
    for (const subgraph of Object.values(subgraphs)) {
        for (const linkId of subgraph.links) {
            linkToSubgraphMap[linkId] = subgraph.id;
        }
    }

    return Object.values(links)
        .filter((link) => selectedGraphId === link.graph)
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

export function getNeighbourIndex(linksInSelectedSubgraphs: LinkWithSubgraphId[]): Record<string, number> {
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

export function isNeighbour(neighbourIndex: Record<string, number>, postAId: PostId, postBId: PostId): boolean {
    const a = parseInt(postAId, 10);
    const b = parseInt(postBId, 10);
    const lowerId = Math.min(a, b);
    const higherId = Math.max(a, b);
    return typeof neighbourIndex[lowerId + "," + higherId] !== "undefined";
}

export function getSubgraphColour(subgraphs: SubgraphsMap, subgraphId: Nullable<SubgraphId>): string {
    if (subgraphId == null) {
        return "#000000";
    }

    return subgraphs[subgraphId]?.colour || stringToColour(`${String(subgraphId)}salt and pepper are good for hashes`);
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
