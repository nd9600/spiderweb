<template>
    <div class="flex flex-col">
        <label class="mb-4 flex flex-col">
            <span
                id="graphsList"
                class="block h h--4"
            >
                Graphs
            </span>
            <span class="flex items-start">
                <button
                    class="btn btn--secondary"
                    type="button"
                    title="scroll to the posts"
                    @click="scrollToPostBar"
                >
                    ↧
                </button>
                <button
                    type="role"
                    class="btn btn--secondary ml-4 mr-2"
                    :disabled="subgraphsInSelectedGraph.length === 0 || selectedSubgraphIds.length === 0"
                    @click="selectedSubgraphIds = []"
                >
                    View all subgraphs
                </button>
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
                            {{ graph.name }}
                        </option>
                    </select>
                </label>
            </span>
        </label>
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
import {mapGetters, mapState} from "vuex";

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
        ...mapState("postsModule", ["graphs"]),
        ...mapGetters("postsModule", ["subgraphsInSelectedGraph"]),

        selectedGraphId: {
            get() {
                return this.$store.state.postsModule.selectedGraphId;
            },
            set(selectedGraphId) {
                this.$store.commit("postsModule/setSelectedGraphId", selectedGraphId);
            }
        },
        selectedSubgraphIds: {
            get() {
                return this.$store.state.postsModule.selectedSubgraphIds;
            },
            set(selectedSubgraphIds) {
                this.$store.commit("postsModule/setSelectedSubgraphIds", selectedSubgraphIds);
            }
        }
    },
    methods: {
        scrollToPostBar() {
            window.scrollBy(0, document.getElementById("postBar").getBoundingClientRect().top - 5);
        },
        scrollToGraph() {
            window.scrollTo(0, document.getElementById("graphsList").offsetTop - 5);
        }
    }
};
</script>