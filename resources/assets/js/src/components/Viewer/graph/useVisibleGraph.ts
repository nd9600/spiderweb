import {computed} from "vue";

import type {LinkId, LinkType, NodePosition, PostId} from "@/src/@types/StoreTypes";
import {useDataStore} from "@/src/store";

export interface VisibleGraph {
    nodes: VisibleNode[];
    links: VisibleLink[];
    neighbourIndex: Record<string, true>;
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

function neighbourKey(postAId: PostId, postBId: PostId): string {
    return [postAId, postBId].sort().join(",");
}

export function useVisibleGraph() {
    const dataStore = useDataStore();

    const selectedGraphId = computed(() => dataStore.selectedGraphId);
    const selectedSubgraphIds = computed(() => dataStore.selectedSubgraphIds);
    const postsInSelectedSubgraphs = computed(() => dataStore.postsInSelectedSubgraphs);
    const linksInSelectedSubgraphs = computed(() => dataStore.linksInSelectedSubgraphs);
    const storedZoom = computed(() => dataStore.zoom);
    const nodePositions = computed<Record<PostId, NodePosition>>(() => {
        const graphId = selectedGraphId.value;
        return graphId == null
            ? {}
            : dataStore.graphs[graphId]?.nodePositions ?? {};
    });

    function buildVisibleGraph(): VisibleGraph {
        const visibleLinks = linksInSelectedSubgraphs.value.map((link): VisibleLink => ({
            id: link.id,
            source: link.source,
            target: link.target,
            type: link.type,
            colour: dataStore.subgraphColour(link.subgraphId),
        }));

        const neighbourIndex: Record<string, true> = {};
        for (const link of visibleLinks) {
            neighbourIndex[neighbourKey(link.source, link.target)] = true;
        }

        return {
            nodes: postsInSelectedSubgraphs.value.map((post): VisibleNode => ({
                id: post.id,
                title: post.title,
                label: dataStore.titleOrBody(post.id),
                position: nodePositions.value[post.id],
            })),
            links: visibleLinks,
            neighbourIndex,
        };
    }

    const visibleGraph = computed(buildVisibleGraph);

    // Dragging a node already moves D3's in-memory node and only persists the final position,
    // so nodePositions are intentionally excluded from the full render trigger.
    const renderDependencies = [
        selectedGraphId,
        selectedSubgraphIds,
        postsInSelectedSubgraphs,
        linksInSelectedSubgraphs,
    ] as const;

    return {
        selectedGraphId,
        storedZoom,
        visibleGraph,
        renderDependencies,
    };
}
