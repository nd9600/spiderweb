<template>
    <div class="flex flex-col">
        <section v-if="Object.keys(graphs).length > 0">
            <h1 class="h h--1">
                Graphs
            </h1>

            <hr class="my-5">
            
            <h2 class="h h--2">
                <label class="flex flex-col items-start">
                    Make new graph
                    <input 
                        v-model="newGraphName" 
                        type="text"
                        class="mb-2 p-2 rounded text-gray-800 text-base placeholder-gray-600"
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

                <GraphEditor
                    v-for="(graph, graphId) in graphs"
                    :key="graphId"
                    :graphId="graphId"
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
            newGraphName: "",
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs"]),
        ...mapGetters("postsModule", ["postIds", "titleOrBody"]),
    },
    methods: {
        ...mapMutations("postsModule", ["makeNewGraph"]),

        makeNewGraphLocal() {
            this.makeNewGraph(this.newGraphName);
            this.newGraphName = "";
        }
    }
};
</script>
