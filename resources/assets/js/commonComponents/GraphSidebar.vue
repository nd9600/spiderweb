<template>
    <div class="flex flex-col">
        <section v-if="Object.keys(graphs).length > 0">
            <h1 class="h h--1">
                Graphs
            </h1>
            <label>
                <select
                    v-model.number="selectedGraphIds"
                    class="mt-2 p-2 rounded text-gray-700"
                    multiple
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

            <hr class="my-5">
            
            <h2 class="h h--2">
                <label>
                    Make new graph
                    <input 
                        v-model="newGraphName" 
                        type="text"
                        class="p-2 rounded text-gray-800 text-base placeholder-gray-600"
                        placeholder="foo graph"
                        @keyup.enter="makeNewGraphLocal"
                    />
                    <button
                        type="submit"
                        class="btn btn--primary"
                        :disabled="newGraphName.trim().length === 0"
                        @click="makeNewGraphLocal"
                    >
                        Create
                    </button>
                </label>
            </h2>

            <hr class="my-5">

            <section>
                <h2 class="h h--2">
                    Edit graphs
                </h2>

                <div
                    v-for="(graph, graphId) in graphs"
                    :key="graphId"
                    class="m-4 p-4 border"
                >
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

                        <div v-if="possiblePostIdsToAddToGraph(graphId).length > 0">
                            <h4 class="h h--4">
                                Add post to graph
                            </h4>
                            <select
                                v-model="postIdToAddToGraph[graphId]"
                                class="p-2 rounded text-gray-700"
                            >
                                <option
                                    v-for="postId in possiblePostIdsToAddToGraph(graphId)"
                                    :key="postId"
                                    :value="postId"
                                >
                                    {{ titleOrBody(postId) }}
                                </option>
                            </select>
                            <button
                                class="py-1 px-2 btn btn--secondary"
                                :disabled="typeof postIdToAddToGraph[graphId] === 'undefined'"
                                @click="addPostToGraph({graphId, postId: postIdToAddToGraph[graphId]})"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    </div>
</template>

<script>
import {mapState, mapGetters, mapMutations } from "vuex";

export default {
    name: "GraphSidebar",
    data() {
        return {
            newGraphName: "",

            postIdToAddToGraph: []
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs"]),
        ...mapGetters("postsModule", ["postIds", "titleOrBody"]),

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
        ...mapMutations("postsModule", ["makeNewGraph", "removeGraph", "addPostToGraph", "removePostFromGraph"]),
        possiblePostIdsToAddToGraph(graphId) {
            return this.postIds.filter(id => !this.graphs[graphId].nodes.includes(id));
        },

        makeNewGraphLocal() {
            this.makeNewGraph(this.newGraphName);
            this.newGraphName = "";
        }
    }
};
</script>
