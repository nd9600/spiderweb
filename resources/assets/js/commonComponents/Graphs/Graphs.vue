<template>
    <div class="flex flex-col">
        <section v-if="Object.keys(graphs).length > 1">
            <label>
                <p class="h h--4">
                    Currently-open graph
                </p>
                <select
                    v-model.number="selectedGraphId"
                    class="select select--secondary"
                    :size="Math.min(Object.keys(graphs).length, 3)"
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
        </section>

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

        selectedGraphId: {
            get() {
                return this.$store.state.dataModule.selectedGraphId;
            },
            set(selectedGraphId) {
                this.$store.commit("dataModule/setSelectedGraphId", selectedGraphId);
            }
        },
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