<template>
    <div class="flex flex-col">
        <section v-if="Object.keys(subgraphs).length > 0">
            <h1 class="h h--1">
                Graphs
            </h1>

            <hr class="my-5">
            
            <h2 class="h h--2">
                <label class="flex flex-col items-start">
                    Make new subgraph
                    <input 
                        v-model="newSubgraphName" 
                        type="text"
                        class="mb-2 p-2 rounded text-gray-800 text-base placeholder-gray-600"
                        placeholder="foo subgraph"
                        @keyup.enter="makeNewSubgraphLocal"
                    />
                    <button
                        type="submit"
                        class="btn btn--primary"
                        :disabled="newSubgraphName.trim().length === 0"
                        @click="makeNewSubgraphLocal"
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

                <GraphEditor
                    v-for="(subgraph, subgraphId) in subgraphs"
                    :key="subgraphId"
                    :subgraphId="subgraphId"
                    class="m-4 p-4 border"
                />
            </section>
        </section>
    </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import GraphEditor from "./GraphEditor";

export default {
    name: "Graphs",
    components: {GraphEditor},
    data() {
        return {
            newSubgraphName: "",
        };
    },
    computed: {
        ...mapState("postsModule", ["subgraphs"]),
        ...mapGetters("postsModule", ["postIds", "titleOrBody"]),
    },
    methods: {
        ...mapMutations("postsModule", ["makeNewSubgraph"]),

        makeNewSubgraphLocal() {
            this.makeNewSubgraph(this.newSubgraphName);
            this.newSubgraphName = "";
        }
    }
};
</script>
