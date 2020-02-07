<template>
    <div>
        <div class="flex justify-between">
            <h3 class="h h--3">
                {{ graph.name }}
            </h3>
            <button
                v-if="graphId !== 1"
                class="py-1 px-2 btn btn--secondary"
                @click="removeGraph(graphId)"
            >
                Remove
            </button>
        </div>
        <div>
            <span class="font-bold">
                Posts
            </span>
            <span
                v-for="postId in graph.nodes"
                :key="postId"
                class="flex justify-between items-center mb-2"
            >
                {{ titleOrBody(postId) }}

                <button
                    class="py-1 px-2 btn btn--secondary"
                    @click="removePostFromGraph({graphId, postId})"
                >
                    Remove
                </button>
            </span>

            <div
                v-if="possiblePostIdsToAddToGraph.length > 0"
                class="mb-4"
            >
                <label>
                    <span class="block h h--4">
                        Add post to graph
                    </span>
                    <select
                        v-model.number="postIdToAddToGraph"
                        class="p-2 rounded text-gray-700 bg-white"
                    >
                        <option
                            v-for="postId in possiblePostIdsToAddToGraph"
                            :key="postId"
                            :value="postId"
                        >
                            {{ titleOrBody(postId) }}
                        </option>
                    </select>
                </label>
                <button
                    class="py-1 px-2 btn btn--secondary"
                    :disabled="postIdToAddToGraph === null"
                    @click="addPostToGraphLocal"
                >
                    Add
                </button>
            </div>

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
    </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";

export default {
    name: "GraphEditor",
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
        ...mapState("postsModule", ["graphs"]),
        ...mapGetters("postsModule", ["postIds", "titleOrBody"]),

        graph() {
            return this.graphs[this.graphId];
        },
        possiblePostIdsToAddToGraph() {
            return this.postIds.filter(id => !this.graph.nodes.includes(id));
        },
    },
    methods: {
        ...mapMutations("postsModule", ["addPostToGraph", "removePostFromGraph", "changeGraphName"]),
        addPostToGraphLocal() {
            this.addPostToGraph({
                graphId: this.graphId,
                postId: this.postIdToAddToGraph
            });
            this.postIdToAddToGraph = null;
        },

        changeGraphNameLocal() {
            if (this.newGraphName.trim().length === 0) {
                return;
            }

            this.changeGraphName({
                graphId: this.graphId,
                newGraphName: this.newGraphName
            });
            this.newGraphName = "";
        }
    }
};
</script>