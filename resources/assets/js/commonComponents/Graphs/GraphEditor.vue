<template>
    <div>
        <span class="flex justify-between">
            <span>{{ graph.name }}</span>
            <button
                v-if="graphId !== 1"
                class="py-1 px-2 btn btn--secondary"
                @click="removeGraph(graphId)"
            >
                Remove
            </button>
        </span>
        <div>
            <h3 class="h h--3">
                Posts
            </h3>
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

            <div v-if="possiblePostIdsToAddToGraph.length > 0">
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
                    @click="addPostToGraphLocal()"
                >
                    Add
                </button>
            </div>
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
            postIdToAddToGraph: null
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
        ...mapMutations("postsModule", ["addPostToGraph", "removePostFromGraph"]),
        addPostToGraphLocal() {
            this.addPostToGraph({
                graphId: this.graphId,
                postId: this.postIdToAddToGraph
            });
            this.postIdToAddToGraph = null;
        }
    }
};
</script>