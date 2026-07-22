<template>
    <div class="flex flex-col">
        <div class="flex items-start">
            <div class="mb-2 flex">
                <div class="flex flex-col">
                    <button
                        id="scrollToPostBarButton"
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
                            v-if="isRenderingGraph"
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
                v-if="Object.keys(graphs).length > 1"
                class="ml-4"
            >
                <span class="block h h--4">
                    Graphs
                </span>
                <select
                    v-model="selectedGraphId"
                    class="select select--secondary w-full"
                    :size="Math.min(Object.keys(graphs).length, 3)"
                >
                    <option
                        v-for="(graph, graphId) in graphs"
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
                            :disabled="selectedSubgraphIds.length === subgraphsInSelectedGraph.length"
                            @click.stop="selectAllSubgraphs"
                        >
                            View all subgraphs
                        </button>
                        <button
                            v-if="selectedSubgraphIds.length > 0"
                            class="my-1 ml-2 text-sm hover:underline"
                            type="button"
                            @click.stop="selectedSubgraphIds = []"
                        >
                            clear
                        </button>
                    </div>
                    <label>
                        <select
                            v-model="selectedSubgraphIds"
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
                    'min-height': graphHeight + 'vh'
                }"
            />
            <PostBar
                :style="{
                    'min-height': postBarHeight + 'vh'
                }"
                @focusPost="focusPost"
                @highlightPost="highlightPost"
                @unhighlightPost="unhighlightPost"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {GraphId, PostId, SubgraphId} from "@/src/@types/StoreTypes";
import GraphViewer from "./GraphViewer.vue";
import PostBar from "./PostBar/PostBar.vue";

import {STORAGE_KEY} from "@/src/components/constants";
import {useDataStore, useRootStore, useSettingsStore} from "@/src/store";

export default defineComponent({
    name: "TheViewer",
    components: {
        GraphViewer,
        PostBar,
    },
    data() {
        const storedData = localStorage.getItem(STORAGE_KEY);

        return {
            localStorageSize: storedData != null
                ? Number((storedData.length / (1000 ** 2)).toFixed(2))
                : 0
        };
    },
    computed: {
        isRenderingGraph() {
            return useRootStore().isRenderingGraph;
        },
        graphHeight() {
            return useSettingsStore().graphHeight;
        },
        postBarHeight() {
            return useSettingsStore().postBarHeight;
        },
        graphs() {
            return useDataStore().graphs;
        },
        subgraphsInSelectedGraph() {
            return useDataStore().subgraphsInSelectedGraph;
        },

        selectedGraphId: {
            get() {
                return useDataStore().selectedGraphId;
            },
            set(selectedGraphId: Nullable<GraphId>) {
                if (selectedGraphId != null) {
                    useDataStore().setSelectedGraphId(selectedGraphId);
                }
            }
        },
        selectedSubgraphIds: {
            get() {
                return useDataStore().selectedSubgraphIds;
            },
            set(selectedSubgraphIds: SubgraphId[]) {
                useDataStore().setSelectedSubgraphIds(selectedSubgraphIds);
            }
        }
    },
    methods: {
        getGraphViewer(): InstanceType<typeof GraphViewer> | null {
            return this.$refs.graphViewer as InstanceType<typeof GraphViewer> | null;
        },
        refreshGraph() {
            this.getGraphViewer()?.refreshGraph();
        },
        zoomIn() {
            this.getGraphViewer()?.zoomIn();
        },
        zoomOut() {
            this.getGraphViewer()?.zoomOut();
        },
        focusPost(postId: PostId) {
            this.getGraphViewer()?.focusPost(postId);
        },
        highlightPost(postId: PostId) {
            this.getGraphViewer()?.highlightPost(postId);
        },
        unhighlightPost(postId: PostId) {
            this.getGraphViewer()?.unhighlightPost(postId);
        },
        scrollToPostBar() {
            const postBar = document.getElementById("postBar");
            if (postBar == null) {
                return;
            }

            window.scrollBy(0, postBar.getBoundingClientRect().top - 5);
        },
        selectAllSubgraphs() {
            useDataStore().selectAllSubgraphs();
        }
    }
});
</script>
