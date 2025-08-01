<template>
    <div>
        <div class="flex justify-between">
            <h3 class="h h--3">
                {{ graph.name }}
            </h3>
            <button
                v-if="graphId !== '1'"
                class="py-1 px-2 btn btn--secondary"
                @click="graphsStore.removeGraph(graphId)"
            >
                Remove
            </button>
        </div>
        <div>
            <label>
                <input
                    v-model="newGraphName"
                    type="text"
                    class="mb-2 p-2 rounded text-gray-800 text-base placeholder-gray-600"
                    placeholder="foo graph"
                    @keyup.enter="changeGraphNameLocal"
                />
                <button
                    class="py-1 px-2 btn btn--secondary"
                    :disabled="newGraphName.trim().length === 0"
                    @click="changeGraphNameLocal"
                >
                    Change graph name
                </button>
            </label>
        </div>

        <Subgraphs
            class="pl-10"
            :graphId="graphId"
        />
    </div>
</template>

<script>
import {useAppStore, useGraphsStore, usePostsStore} from "@/src/stores";
import Subgraphs from "./Subgraphs.vue";

export default {
    name: "GraphEditor",
    components: {
        Subgraphs
    },
    props: {
        graphId: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            postIdToAddToGraph: null,
            newGraphName: ""
        };
    },
    computed: {
        appStore() {
            return useAppStore();
        },
        graphsStore() {
            return useGraphsStore();
        },
        postsStore() {
            return usePostsStore();
        },
        graphs() {
            return this.graphsStore.graphs;
        },
        postIds() {
            return this.postsStore.postIds;
        },
        titleOrBody() {
            return this.postsStore.titleOrBody;
        },

        graph() {
            return this.graphs[this.graphId];
        },
    },
    methods: {
        changeGraphNameLocal() {
            if (this.newGraphName.trim().length === 0) {
                return;
            }

            this.graphsStore.changeGraphName({
                graphId: this.graphId,
                newGraphName: this.newGraphName
            });
            this.newGraphName = "";
        }
    }
};
</script>