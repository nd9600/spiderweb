<template>
    <div class="min-h-full flex flex-col">
        <label class="my-4 flex flex-col">
            Graphs
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
        <offline-graph
            class="pb-4 w-full"
            style="min-height: 50vh"
        />
        <post-sidebar
            class="w-full"
            style="min-height: 50vh"
        />
    </div>
</template>

<script>
import OfflineGraph from "../offline/OfflineGraph";
import PostSidebar from "@/js/commonComponents/PostSidebar";

import {mapState} from "vuex";

export default {
    name: "Viewer",
    components: {
        OfflineGraph,
        PostSidebar
    },
    computed: {
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