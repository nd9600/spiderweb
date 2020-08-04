<template>
    <div class="flex flex-col">
        <Subgraphs class="pl-10" />

        <hr class="my-5">

        <section>
            <h2 class="h h--2">
                Make new graph
            </h2>
            <label class="flex flex-col items-start">
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
        </section>

        <hr class="my-5">

        <section>
            <h2 class="h h--2">
                Edit graphs
            </h2>

            <GraphEditor
                v-for="(graph, graphId) in graphs"
                :key="graphId"
                :graphId="graphId"
                class="m-4 p-4 border border-gray-500"
            />
        </section>
    </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import Subgraphs from "./Subgraphs";
import GraphEditor from "./GraphEditor";

export default {
    name: "Graphs",
    components: {Subgraphs, GraphEditor},
    data() {
        return {
            newGraphName: "",
        };
    },
    computed: {
        ...mapState("dataModule", ["graphs"]),
        ...mapGetters("dataModule", ["postIds", "titleOrBody"]),
    },
    methods: {
        ...mapMutations("dataModule", ["makeNewGraph"]),

        makeNewGraphLocal() {
            this.makeNewGraph(this.newGraphName);
            this.newGraphName = "";
        }
    }
};
</script>