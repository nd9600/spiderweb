<template>
    <div>
        <div class="flex justify-between">
            <h3
                class="h h--3"
                :style="{color: newSubgraphColour}"
            >
                {{ subgraph.name }}
            </h3>
            <button
                class="py-1 px-2 btn btn--secondary"
                @click="removeSubgraph(subgraphId)"
            >
                Remove
            </button>
        </div>
        <div class="flex flex-col">
            <label>
                <input
                    v-model="newSubgraphName"
                    type="text"
                    class="mb-2 p-2 rounded text-gray-800 text-base placeholder-gray-600"
                    placeholder="foo subgraph"
                    @keyup.enter="changeSubgraphNameLocal"
                />
                <button
                    class="py-1 px-2 btn btn--secondary"
                    :disabled="newSubgraphName.trim().length === 0"
                    @click="changeSubgraphNameLocal"
                >
                    Change subgraph name
                </button>
            </label>
            <label class="mt-2 flex items-center">
                <span class="mr-4">Colour: </span>
                <input
                    v-model="newSubgraphColour"
                    class="ml-4 mr-1"
                    type="color"
                />
                <button
                    class="py-1 px-2 btn btn--secondary"
                    :disabled="newSubgraphColour === subgraph.colour"
                    @click="changeSubgraphColour({subgraphId, colour: newSubgraphColour})"
                >
                    Change subgraph colour
                </button>
            </label>
        </div>
    </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";

export default {
    name: "SubgraphEditor",
    props: {
        subgraphId: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            postIdToAddToGraph: null,
            newSubgraphName: "",
            newSubgraphColour: "#000000"
        };
    },
    computed: {
        ...mapState("dataModule", ["subgraphs"]),
        ...mapGetters("dataModule", ["postIds", "titleOrBody"]),

        subgraph() {
            return this.subgraphs[this.subgraphId];
        }
    },
    mounted() {
        this.newSubgraphColour = this.subgraph.colour || "#000000";
    },
    methods: {
        ...mapMutations("dataModule", ["changeSubgraphName", "changeSubgraphColour", "removeSubgraph"]),
        changeSubgraphNameLocal() {
            if (this.newSubgraphName.trim().length === 0) {
                return;
            }

            this.changeSubgraphName({
                subgraphId: this.subgraphId,
                newSubgraphName: this.newSubgraphName
            });
            this.newSubgraphName = "";
        }
    }
};
</script>