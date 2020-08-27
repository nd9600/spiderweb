<template>
    <div class="flex flex-col">
        <section>
            <h2 class="h h--2">
                Make new subgraph
            </h2>
            <label class="flex flex-col items-start">
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
        </section>

        <hr class="my-5">

        <section v-if="subgraphsInGraph.length > 0">
            <h2 class="h h--2">
                Subgraphs
            </h2>

            <SubgraphEditor
                v-for="subgraph in subgraphsInGraph"
                :key="subgraph.id"
                :subgraphId="subgraph.id"
                class="m-4 p-4 border border-gray-500"
            />
        </section>
    </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import SubgraphEditor from "./SubgraphEditor";

export default {
    name: "Subgraphs",
    components: {SubgraphEditor},
    props: {
        graphId: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            newSubgraphName: "",
        };
    },
    computed: {
        ...mapState("dataModule", ["graphs", "subgraphs"]),
        ...mapGetters("dataModule", ["subgraphsInGraph", "postIds", "titleOrBody"]),

        subgraphsInGraph() {
            return this.graphs[this.graphId].subgraphs
                .map(id => this.subgraphs[id]);
        }
    },
    methods: {
        ...mapMutations("dataModule", ["makeNewSubgraph"]),

        makeNewSubgraphLocal() {
            this.makeNewSubgraph({
                graphId: this.graphId,
                newSubgraphName: this.newSubgraphName
            });
            this.newSubgraphName = "";
        }
    }
};
</script>
