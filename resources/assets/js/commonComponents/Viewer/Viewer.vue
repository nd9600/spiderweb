<template>
    <div class="min-h-full flex flex-col">
        <label class="mb-4 flex flex-col">
            <span class="block h h--4">
                Graphs
            </span>
            <select
                v-model.number="selectedGraphIds"
                class="p-2 rounded text-gray-700"
                multiple
                size="7"
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
        <div
            class="flex"
            :style="{
                'flex-direction': graphAndPostsDirection === 'horizontal' ? 'row' : 'column'
            }"
        >
            <div class="flex flex-col"> <!-- flex-col makes the <svg> stretch for some reason, if it has display: inline -->
                <offline-graph
                    class="pb-4 w-full"
                    :style="{
                        'min-height': graphHeight + 'vh'
                    }"
                />
            </div>
            <PostBar
                class="w-full"
                :style="{
                    'min-height': postBarHeight + 'vh'
                }"
            />
        </div>
    </div>
</template>

<script>
import OfflineGraph from "./OfflineGraph";
import PostBar from "./PostBar/PostBar";

import {mapState} from "vuex";

export default {
    name: "Viewer",
    components: {
        OfflineGraph,
        PostBar
    },
    computed: {
        ...mapState("settingsModule", ["graphAndPostsDirection", "graphHeight", "postBarHeight"]),
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
};
</script>