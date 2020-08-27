<template>
    <div>
        <div class="flex justify-between">
            <h3 class="h h--3">
                {{ graph.name }}
            </h3>
            <button
                v-if="graphId !== '1'"
                class="py-1 px-2 btn btn--secondary"
                @click="removeGraph(graphId)"
            >
                Remove
            </button>
        </div>
        <div>
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

        <Subgraphs
            class="pl-10"
            :graphId="graphId"
        />
    </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import Subgraphs from "./Subgraphs";

export default {
    name: "GraphEditor",
    components: {
        Subgraphs
    },
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
        ...mapState("dataModule", ["graphs"]),
        ...mapGetters("dataModule", ["postIds", "titleOrBody"]),

        graph() {
            return this.graphs[this.graphId];
        },
    },
    methods: {
        ...mapMutations("dataModule", ["changeGraphName", "removeGraph"]),
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