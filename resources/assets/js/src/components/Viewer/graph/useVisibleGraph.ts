import {computed} from "vue";

import type {LinkId, LinkType, NodePosition, PostId} from "@/src/@types/StoreTypes";
import {useDataStore} from "@/src/store";

export interface VisibleGraph {
    nodes: VisibleNode[];
    links: VisibleLink[];
    neighbourIdsByPostId: NeighbourIdsByPostId;
}

export interface VisibleNode {
    id: PostId;
    title: string;
    label: string;
    position?: NodePosition;
}

export interface VisibleLink {
    id: LinkId;
    source: PostId;
    target: PostId;
    type: LinkType;
    colour: string;
}

type NeighbourIdsByPostId = Record<PostId, Record<PostId, true>>;

export function useVisibleGraph() {
    const dataStore = useDataStore();

    const selectedGraphId = computed(() => dataStore.selectedGraphId);
    const selectedSubgraphIds = computed(() => dataStore.selectedSubgraphIds);
    const selectedPostIdSet = computed(() => dataStore.postIdsInSelectedSubgraphsSet);
    const selectedPostIds = computed(() => [...selectedPostIdSet.value]);
    const linksInSelectedSubgraphs = computed(() => dataStore.linksInSelectedSubgraphs);
    const storedZoom = computed(() => dataStore.zoom);
    const nodePositions = computed<Record<PostId, NodePosition>>(() => {
        const graphId = selectedGraphId.value;
        return graphId == null
            ? {}
            : dataStore.graphs[graphId]?.nodePositions ?? {};
    });

    const visibleNodes = computed(() => {
        const nodes: VisibleNode[] = [];
        for (const postId of selectedPostIds.value) {
            const post = dataStore.posts[postId];
            if (post == null) {
                continue;
            }

            nodes.push({
                id: post.id,
                title: post.title,
                label: dataStore.titleOrBody(post.id),
            });
        }

        return nodes;
    });

    const visibleLinks = computed(() => linksInSelectedSubgraphs.value
        .filter((link) => selectedPostIdSet.value.has(link.source) && selectedPostIdSet.value.has(link.target))
        .map((link): VisibleLink => ({
            id: link.id,
            source: link.source,
            target: link.target,
            type: link.type,
            colour: dataStore.subgraphColour(link.subgraphId),
        })));

    function addNeighbour(
        neighbourIdsByPostId: NeighbourIdsByPostId,
        postId: PostId,
        neighbourId: PostId
    ): void {
        if (neighbourIdsByPostId[postId] == null) {
            neighbourIdsByPostId[postId] = {};
        }

        neighbourIdsByPostId[postId][neighbourId] = true;
    }

    function buildVisibleGraph(): VisibleGraph {
        const neighbourIdsByPostId: NeighbourIdsByPostId = {};
        for (const link of visibleLinks.value) {
            addNeighbour(neighbourIdsByPostId, link.source, link.target);
            addNeighbour(neighbourIdsByPostId, link.target, link.source);
        }

        return {
            nodes: visibleNodes.value.map((node): VisibleNode => ({
                ...node,
                position: nodePositions.value[node.id],
            })),
            links: visibleLinks.value,
            neighbourIdsByPostId,
        };
    }

    const visibleGraph = computed(buildVisibleGraph);

    // Dragging a node already moves D3's in-memory node and only persists the final position,
    // so nodePositions are intentionally excluded from the full render trigger.
    const renderDependencies = [
        selectedGraphId,
        selectedSubgraphIds,
        visibleNodes,
        visibleLinks,
    ] as const;

    return {
        selectedGraphId,
        storedZoom,
        visibleGraph,
        renderDependencies,
    };
}
