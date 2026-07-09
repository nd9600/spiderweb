<template>
    <section class="h-full w-full relative pb-4 px-0 flex">
        <svg
            id="graphSvg"
            ref="svgElement"
            class="w-full cursor-move border bg-white"
            @click="onSvgClick"
        >
            <defs>
                <marker
                    id="arrowhead"
                    viewBox="-0 -5 10 10"
                    refX="15"
                    refY="0"
                    orient="auto"
                    markerWidth="2"
                    markerHeight="2"
                >
                    <path
                        d="M 0,-5 L 10 ,0 L 0,5"
                        fill="#353535"
                        style="stroke: none;"
                    >
                    </path>
                </marker>

                <filter id="postHoverFilter">
                    <feFlood flood-color="#000"></feFlood>
                    <feComponentTransfer>
                        <feFuncA
                            type="linear"
                            slope="0.75"
                        ></feFuncA>
                    </feComponentTransfer>
                    <feComposite in="SourceGraphic"></feComposite>
                </filter>
            </defs>
            <g
                ref="rootElement"
                transform="translate(5, 15) scale(0.5)"
            >
                <g
                    ref="linksElement"
                    class="graph__links"
                ></g>
                <g
                    ref="nodesElement"
                    class="graph__nodes"
                ></g>
            </g>
        </svg>
        <FloatingActionButton />
    </section>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, ref, watch} from "vue";
import debounce from "lodash/debounce";

import {ClickMode, type NodePosition, type PostId} from "@/src/@types/StoreTypes";
import {useClickerStore, useDataStore, useRootStore} from "@/src/store";
import FloatingActionButton from "./FloatingActionButton.vue";
import {buildGraphData} from "./graph/graphData";
import {useGraphEventBus} from "./graph/useGraphEventBus";
import {useGraphScene} from "./graph/useGraphScene";
import {useGraphZoom} from "./graph/useGraphZoom";

defineOptions({
    name: "GraphViewer",
});

const dataStore = useDataStore();
const clickerStore = useClickerStore();
const rootStore = useRootStore();

const svgElement = ref<SVGSVGElement | null>(null);
const rootElement = ref<SVGGElement | null>(null);
const linksElement = ref<SVGGElement | null>(null);
const nodesElement = ref<SVGGElement | null>(null);

const originalLinkStroke = 20;
const linkStroke = ref(originalLinkStroke);
const shouldResetZooming = ref(false);

const selectedGraphId = computed(() => dataStore.selectedGraphId);
const selectedSubgraphIds = computed(() => dataStore.selectedSubgraphIds);
const postsInSelectedSubgraphs = computed(() => dataStore.postsInSelectedSubgraphs);
const linksInSelectedSubgraphs = computed(() => dataStore.linksInSelectedSubgraphs);
const nodePositions = computed<Record<PostId, NodePosition>>(() => {
    const graphId = selectedGraphId.value;
    return graphId == null
        ? {}
        : dataStore.graphs[graphId]?.nodePositions ?? {};
});

function isPhone(): boolean {
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    return viewportWidth <= 576;
}

let graphZoomControls: Nullable<ReturnType<typeof useGraphZoom>> = null;
function focusOnPost(postId: PostId, speed = 1): void {
    graphZoomControls?.focusOnPost(postId, speed);
}

const graphScene = useGraphScene({
    svgElement,
    rootElement,
    linksElement,
    nodesElement,
    getLinkStroke: () => linkStroke.value,
    getSubgraphColour: (subgraphId) => dataStore.subgraphColour(subgraphId),
    getTitleOrBody: (postId) => dataStore.titleOrBody(postId),
    isNeighbour: (postAId, postBId) => dataStore.isNeighbour(postAId, postBId),
    focusOnPost,
    onLinkClick: (payload) => clickerStore.handleLinkClick(payload),
    onPostClick: (post) => {
        void clickerStore.handlePostClick(post);
    },
    onPostPositioned: (postId, position) => {
        dataStore.setPostPosition({postId, position});
    },
});

const graphZoom = useGraphZoom({
    svg: graphScene.svg,
    rootG: graphScene.rootG,
    linkStroke,
    originalLinkStroke,
    getNodesWithCoordinates: graphScene.getNodesWithCoordinates,
    setNodeRadius: graphScene.setNodeRadius,
    saveZoom: (zoom) => dataStore.setZoom(zoom),
    isPhone,
});
graphZoomControls = graphZoom;

function maybeResetZoom(): void {
    if (!shouldResetZooming.value) {
        return;
    }

    shouldResetZooming.value = false;
    void nextTick(() => {
        graphZoom.resetZoomToCenter();
    });
}

function renderGraph(): void {
    rootStore.setIsRenderingGraph(true);
    try {
        const graphData = buildGraphData(
            postsInSelectedSubgraphs.value,
            linksInSelectedSubgraphs.value,
            nodePositions.value
        );
        const didRender = graphScene.renderGraph(graphData);
        if (didRender) {
            maybeResetZoom();
        }
    } finally {
        rootStore.setIsRenderingGraph(false);
    }
}

const debouncedRenderGraph = debounce(
    () => {
        renderGraph();
    },
    500,
    {
        leading: true,
        trailing: true,
    }
);

watch(selectedGraphId, () => {
    shouldResetZooming.value = true;
    debouncedRenderGraph();
});

watch([
    selectedSubgraphIds,
    postsInSelectedSubgraphs,
    linksInSelectedSubgraphs,
], () => {
    debouncedRenderGraph();
});

onMounted(() => {
    if (!graphScene.initializeScene()) {
        return;
    }

    graphZoom.setupZooming();
    graphZoom.applyStoredZoom(dataStore.zoom);
    void nextTick(() => {
        debouncedRenderGraph();
    });
});

useGraphEventBus({
    focusOnPost: (postId) => {
        graphZoom.focusOnPost(postId);
    },
    highlightPost: graphScene.highlightPost,
    unhighlightPost: graphScene.unhighlightPost,
    refreshGraph: () => {
        debouncedRenderGraph();
    },
    zoomIn: graphZoom.zoomIn,
    zoomOut: graphZoom.zoomOut,
});

function onSvgClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.id !== "graphSvg") {
        return;
    }

    if (clickerStore.shouldShowClickButtonMenu) {
        clickerStore.setShouldShowClickButtonMenu(false);
    }

    if (clickerStore.clickMode !== ClickMode.OpenPosts) {
        clickerStore.setClickMode(ClickMode.OpenPosts);
    }
}
</script>

<style>
    :root {
        --node-text-size: 48px;
        --link-stroke-width: 20px;
    }
    #graphSvg {
        min-width: 33%;
    }

    .graph__link {
        fill: none;
        stroke-width: var(--link-stroke-width);
        cursor: pointer;
    }
    .graph__link--sidenote {
        stroke-dasharray: 50, 50;
    }
    .graph__link--link {
        stroke-dasharray: 10, 10;
    }

    .node__circle {
        fill: #353535;
        stroke: none;
        cursor: pointer;
    }

    .node__text {
        cursor: pointer;
        text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff;
        fill: #333333;

        font-size: var(--node-text-size);
        font-weight: bold;
        stroke-width: 0;
    }
</style>
