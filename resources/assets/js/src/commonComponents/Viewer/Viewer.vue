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
                        @click.stop="$root.$emit('zoomOut')"
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
                            @click.stop="$root.$emit('refreshGraph')"
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
                        @click.stop="$root.$emit('zoomIn')"
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
            <OfflineGraph
                ref="offlineGraph"
                :style="{
                    'min-height': graphHeight + 'vh'
                }"
            />
            <PostBar
                :style="{
                    'min-height': postBarHeight + 'vh'
                }"
            />
        </div>
    </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";

import OfflineGraph from "./OfflineGraph";
import PostBar from "./PostBar/PostBar";

import {STORAGE_KEY} from "@/src/commonComponents/constants";

export default {
    name: "Viewer",
    components: {
        OfflineGraph,
        PostBar,
    },
    data() {
        const storedData = localStorage.getItem(STORAGE_KEY);

        return {
            localStorageSize: storedData != null
                ? (storedData.length / (1000 ** 2)).toFixed(2)
                : 0
        };
    },
    computed: {
        ...mapState(["isRenderingGraph"]),
        ...mapState("settingsModule", ["graphHeight", "postBarHeight"]),
        ...mapState("dataModule", ["graphs"]),
        ...mapGetters("dataModule", ["subgraphsInSelectedGraph"]),

        selectedGraphId: {
            get() {
                return this.$store.state.dataModule.selectedGraphId;
            },
            set(selectedGraphId) {
                this.$store.commit("dataModule/setSelectedGraphId", selectedGraphId);
            }
        },
        selectedSubgraphIds: {
            get() {
                return this.$store.state.dataModule.selectedSubgraphIds;
            },
            set(selectedSubgraphIds) {
                this.$store.commit("dataModule/setSelectedSubgraphIds", selectedSubgraphIds);
            }
        }
    },
    methods: {
        ...mapMutations("dataModule", ["selectAllSubgraphs"]),

        scrollToPostBar() {
            window.scrollBy(0, document.getElementById("postBar").getBoundingClientRect().top - 5);
        }
    }
};
</script>