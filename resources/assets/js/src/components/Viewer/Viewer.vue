<template>
    <div class="flex flex-col">
        <div class="flex items-start">
            <div class="mb-2 flex">
                <div class="flex flex-col">
                    <button
                        id="scrollToPostBarButton"
                        ref="scrollToPostBarButton"
                        class="btn btn--secondary"
                        type="button"
                        title="scroll to the posts"
                        @click.stop="scrollToPostBar"
                    >
                        ↧
                    </button>
                    <button
                        class="btn btn--secondary mt-2"
                        type="button"
                        title="zoom out"
                        @click.stop="zoomOut"
                    >
                        -
                    </button>
                </div>
                <div class="flex flex-col ml-2">
                    <div>
                        <button
                            class="btn btn--secondary"
                            type="button"
                            title="refresh the graph"
                            @click.stop="refreshGraph"
                        >
                            ⟳
                        </button>
                        <div
                            v-if="rootStore.isRenderingGraph"
                            class="mt-1 flex justify-center items-center"
                        >
                            <div class="spinner spinner--sm"></div>
                        </div>
                    </div>
                    <button
                        class="btn btn--secondary mt-2"
                        type="button"
                        title="zoom in"
                        @click.stop="zoomIn"
                    >
                        +
                    </button>
                </div>
            </div>
            <label
                v-if="graphCount > 1"
                class="ml-4"
            >
                <span class="block h h--4">
                    Graphs
                </span>
                <select
                    v-model="selectedGraphIdModel"
                    class="select select--secondary w-full"
                    :size="Math.min(graphCount, 3)"
                >
                    <option
                        v-for="(graph, graphId) in dataStore.graphs"
                        :key="graphId"
                        :value="graphId"
                    >
                        {{ graph.name }}
                    </option>
                </select>
            </label>
            <div class="ml-4 flex flex-col items-start">
                <span id="graphsList"></span>
                <h4
                    v-if="subgraphsInSelectedGraph.length > 0"
                    class="h h--4"
                >
                    Subgraphs
                </h4>
                <div
                    v-if="subgraphsInSelectedGraph.length > 0"
                    class="flex"
                >
                    <div class="mr-2 flex flex-col items-start">
                        <button
                            class="btn btn--secondary"
                            type="button"
                            :disabled="selectedSubgraphIdsModel.length === subgraphsInSelectedGraph.length"
                            @click.stop="dataStore.selectAllSubgraphs()"
                        >
                            View all subgraphs
                        </button>
                        <button
                            v-if="selectedSubgraphIdsModel.length > 0"
                            class="my-1 ml-2 text-sm hover:underline"
                            type="button"
                            @click.stop="selectedSubgraphIdsModel = []"
                        >
                            clear
                        </button>
                    </div>
                    <label>
                        <select
                            v-model="selectedSubgraphIdsModel"
                            class="select select--secondary w-full"
                            multiple
                            :size="Math.min(subgraphsInSelectedGraph.length, 7)"
                        >
                            <option
                                v-for="subgraph in subgraphsInSelectedGraph"
                                :key="subgraph.id"
                                :value="subgraph.id"
                            >
                                {{ subgraph.name }}
                            </option>
                        </select>
                    </label>
                </div>
            </div>
            <p
                v-if="localStorageSize > 2"
                class="text-xs"
            >
                Your stored data is {{ localStorageSize }}mb, the maximum that can be stored is <a
                    class="link"
                    href="https://stackoverflow.com/questions/2989284/what-is-the-max-size-of-localstorage-values/33085019#33085019"
                    target="_blank"
                    rel="noopener"
                >around 5mb</a>.
            </p>
        </div>
        <div class="flex flex-col">
            <GraphViewer
                ref="graphViewer"
                :style="{
                    'min-height': settingsStore.graphHeight + 'vh'
                }"
            />
            <PostBar
                ref="postBar"
                :style="{
                    'min-height': settingsStore.postBarHeight + 'vh'
                }"
                @focusPost="focusPost"
                @highlightPost="highlightPost"
                @unhighlightPost="unhighlightPost"
                @scrollToTop="scrollToTopControls"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
///// imports /////
import {computed, useTemplateRef} from "vue";
import type {GraphId, PostId, SubgraphId} from "@/src/@types/StoreTypes";
import GraphViewer from "./GraphViewer.vue";
import PostBar from "./PostBar/PostBar.vue";

import {STORAGE_KEY} from "@/src/components/constants";
import {useDataStore, useRootStore, useSettingsStore} from "@/src/store";

defineOptions({
    name: "TheViewer",
});

///// refs and variables /////
const rootStore = useRootStore();
const settingsStore = useSettingsStore();
const dataStore = useDataStore();
const graphViewer = useTemplateRef<InstanceType<typeof GraphViewer>>("graphViewer");
const postBar = useTemplateRef<InstanceType<typeof PostBar>>("postBar");
const scrollToPostBarButton = useTemplateRef<HTMLButtonElement>("scrollToPostBarButton");
const storedData = localStorage.getItem(STORAGE_KEY);
const localStorageSize = storedData != null
    ? Number((storedData.length / (1000 ** 2)).toFixed(2))
    : 0;

///// computed /////
const graphCount = computed(() => Object.keys(dataStore.graphs).length);
const subgraphsInSelectedGraph = computed(() => {
    if (dataStore.selectedGraphId == null) {
        return [];
    }

    return dataStore.subgraphIndexes.subgraphsByGraphId[dataStore.selectedGraphId] ?? [];
});

const selectedGraphIdModel = computed({
    get() {
        return dataStore.selectedGraphId;
    },
    set(selectedGraphId: Nullable<GraphId>) {
        if (selectedGraphId != null) {
            dataStore.setSelectedGraphId(selectedGraphId);
        }
    }
});

const selectedSubgraphIdsModel = computed({
    get() {
        return dataStore.selectedSubgraphIds;
    },
    set(selectedSubgraphIds: SubgraphId[]) {
        dataStore.setSelectedSubgraphIds(selectedSubgraphIds);
    }
});

///// functions /////
function refreshGraph(): void {
    graphViewer.value?.refreshGraph();
}

function zoomIn(): void {
    graphViewer.value?.zoomIn();
}

function zoomOut(): void {
    graphViewer.value?.zoomOut();
}

function focusPost(postId: PostId): void {
    graphViewer.value?.focusPost(postId);
}

function highlightPost(postId: PostId): void {
    graphViewer.value?.highlightPost(postId);
}

function unhighlightPost(postId: PostId): void {
    graphViewer.value?.unhighlightPost(postId);
}

function scrollToPostBar(): void {
    postBar.value?.scrollToPostBar();
}

function scrollToTopControls(): void {
    if (scrollToPostBarButton.value == null) {
        return;
    }

    window.scrollBy(0, scrollToPostBarButton.value.getBoundingClientRect().top - 5);
}
</script>
