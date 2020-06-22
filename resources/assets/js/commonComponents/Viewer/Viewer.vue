<template>
    <div class="flex flex-col">
        <label class="mb-4 flex flex-col">
            <span
                id="graphsList"
                class="block h h--4"
            >
                Graphs
            </span>
            <span class="flex">
                <button
                    class="btn btn--secondary mr-2"
                    type="button"
                    title="scroll to the posts"
                    @click="scrollToPostBar"
                >
                    ↧
                </button>
                <select
                    v-model.number="selectedGraphIds"
                    class="select select--secondary w-full"
                    multiple
                    :size="Math.min(Object.keys(graphs).length, 7)"
                >
                    <option
                        v-for="(graph, graphId) in graphs"
                        :key="graphId"
                        :value="graphId"
                    >
                        {{ graph.name }}
                    </option>
                </select>
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
import {mapState} from "vuex";

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

        selectedGraphIds: {
            get() {
                return this.$store.state.postsModule.selectedGraphIds;
            },
            set(selectedGraphIds) {
                this.$store.commit("postsModule/setSelectedGraphIds", selectedGraphIds);
            }
        },
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