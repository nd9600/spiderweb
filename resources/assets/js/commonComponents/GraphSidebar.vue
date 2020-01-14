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
                            class="flex justify-between"
                            v-for="postId in graph.nodes"
                            :key="postId"
                        >
                            {{ titleOrBody(postId) }}

                            <button
                                class="py-1 px-2 btn btn--secondary"
                                @click="removePostFromGraph({graphName, postId})"
                            >
                                Remove
                            </button>
                        </span>
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
            newGraphName: ""
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs", "posts"]),
        ...mapGetters("postsModule", ["graphNames"]),

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
        ...mapMutations("postsModule", ["makeNewGraph", "removeGraph", "removePostFromGraph"]),
        makeNewGraphLocal() {
            this.makeNewGraph(this.newGraphName);
            this.newGraphName = "";
        },

        titleOrBody(postId) {
            const post = this.posts[postId];
            return post.title.length > 0
                ? post.title
                : post.body.substr(0, 20);
        },
    }
};
</script>
