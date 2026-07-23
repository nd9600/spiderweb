<template>
    <section class="h-full w-full relative pb-4 px-0 flex">
        <svg
            id="graphSvg"
            ref="svgElement"
            class="w-full cursor-move border bg-white"
            @click="renderer.handleSvgClick"
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
///// imports /////
import {nextTick, onMounted, ref, useTemplateRef, watch} from "vue";
import debounce from "lodash/debounce";

import {useRootStore} from "@/src/store";
import FloatingActionButton from "./FloatingActionButton.vue";
import {useGraphRenderer} from "./graph/useGraphRenderer";
import {useVisibleGraph} from "./graph/useVisibleGraph";

defineOptions({
    name: "GraphViewer",
});

///// refs and variables /////
const rootStore = useRootStore();
const {
    selectedGraphId,
    storedZoom,
    visibleGraph,
    renderDependencies,
} = useVisibleGraph();

const svgElement = useTemplateRef<SVGSVGElement>("svgElement");
const rootElement = useTemplateRef<SVGGElement>("rootElement");
const linksElement = useTemplateRef<SVGGElement>("linksElement");
const nodesElement = useTemplateRef<SVGGElement>("nodesElement");

const shouldResetZooming = ref(false);

const renderer = useGraphRenderer({
    svgElement,
    rootElement,
    linksElement,
    nodesElement,
});

///// functions /////
function maybeResetZoom(): void {
    if (!shouldResetZooming.value) {
        return;
    }

    shouldResetZooming.value = false;
    void nextTick(() => {
        renderer.resetZoom();
    });
}

function renderGraph(): void {
    rootStore.setIsRenderingGraph(true);
    try {
        const didRender = renderer.render(visibleGraph.value);
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

function refreshGraph(): void {
    debouncedRenderGraph();
}

defineExpose({
    focusPost: renderer.focusPost,
    highlightPost: renderer.highlightPost,
    unhighlightPost: renderer.unhighlightPost,
    zoomIn: renderer.zoomIn,
    zoomOut: renderer.zoomOut,
    refreshGraph,
});

///// watchers /////
watch(selectedGraphId, () => {
    shouldResetZooming.value = true;
});

watch(renderDependencies, () => {
    debouncedRenderGraph();
});

///// lifecycle /////
onMounted(() => {
    if (!renderer.mount()) {
        return;
    }

    renderer.setZoom(storedZoom.value);
    void nextTick(() => {
        refreshGraph();
    });
});
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
