<template>
    <div class="flex flex-col">
        <section v-if="graphNames.length > 0">
            <h1 class="h h--1">
                Graphs
            </h1>
            <label>
                <select
                    v-model="selectedGraphNames"
                    class="mt-2 p-2 rounded text-gray-700"
                    multiple
                >
                    <option
                        v-for="graphName in graphNames"
                        :key="graphName"
                        :value="graphName"
                    >
                        {{ graphName }}
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
                    v-for="(graph, graphName) in graphs"
                    :key="graphName"
                    class="m-4 p-4 border"
                >
                    <span class="flex justify-between">
                        <span>{{ graphName }}</span>
                        <button
                            v-if="graphName !== 'default'"
                            class="py-1 px-2 btn btn--secondary"
                            @click="removeGraph(graphName)"
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
                            class="flex justify-between"
                        >
                            {{ titleOrBody(postId) }}

                            <button
                                class="py-1 px-2 btn btn--secondary"
                                @click="removePostFromGraph({graphName, postId})"
                            >
                                Remove
                            </button>
                        </span>

                        <div v-if="possiblePostIdsToAddToGraph(graphName).length > 0">
                            <h4 class="h h--4">
                                Add post to graph
                            </h4>
                            <select
                                v-model="postIdToAddToGraph[graphName]"
                                class="p-2 rounded text-gray-700"
                            >
                                <option
                                    v-for="postId in possiblePostIdsToAddToGraph(graphName)"
                                    :key="postId"
                                    :value="postId"
                                >
                                    {{ titleOrBody(postId) }}
                                </option>
                            </select>
                            <button
                                class="py-1 px-2 btn btn--secondary"
                                :disabled="typeof postIdToAddToGraph[graphName] === 'undefined'"
                                @click="addPostToGraph({graphName, postId: postIdToAddToGraph[graphName]})"
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
        ...mapGetters("postsModule", ["graphNames", "postIds", "titleOrBody"]),

        selectedGraphNames: {
            get() {
                return this.$store.state.postsModule.selectedGraphNames;
            },
            set(selectedGraphNames) {
                this.$store.commit("postsModule/setSelectedGraphNames", selectedGraphNames);
            }
        },
    },
    methods: {
        ...mapMutations("postsModule", ["makeNewGraph", "removeGraph", "addPostToGraph", "removePostFromGraph"]),
        possiblePostIdsToAddToGraph(graphName) {
            return this.postIds.filter(id => !this.graphs[graphName].nodes.includes(id));
        },

        makeNewGraphLocal() {
            this.makeNewGraph(this.newGraphName);
            this.newGraphName = "";
        }
    }
};
</script>
