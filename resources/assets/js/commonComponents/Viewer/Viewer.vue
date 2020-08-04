<template>
    <div class="flex flex-col">
        <div class="flex items-start">
            <button
                class="btn btn--secondary"
                type="button"
                title="scroll to the posts"
                @click.stop="scrollToPostBar"
            >
                ↧
            </button>
            <label class="ml-4">
                <span class="block h h--4">
                    Graphs
                </span>
                <select
                    v-model.number="selectedGraphId"
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
                            v-model.number="selectedSubgraphIds"
                            class="select select--secondary w-full"
                            multiple
                            :size="Math.min(Object.keys(subgraphsInSelectedGraph).length, 7)"
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

        <button
            class="btn btn--secondary mt-4"
            type="button"
            title="scroll to the graph"
            @click="scrollToGraph"
        >
            ↥
        </button>
    </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";

import OfflineGraph from "./OfflineGraph";
import PostBar from "./PostBar/PostBar";

export default {
    name: "Viewer",
    components: {
        OfflineGraph,
        PostBar,
    },
    computed: {
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
        },
        scrollToGraph() {
            window.scrollTo(0, document.getElementById("graphsList").offsetTop - 5);
        }
    }
};
</script>