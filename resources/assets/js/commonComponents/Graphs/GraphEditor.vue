<template>
    <div>
        <div class="flex justify-between">
            <h3 class="h h--3">
                {{ subgraph.name }}
            </h3>
            <button
                v-if="subgraphId !== 1"
                class="py-1 px-2 btn btn--secondary"
                @click="removeSubgraph(subgraphId)"
            >
                Remove
            </button>
        </div>
        <div>
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
        </div>
    </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";

export default {
    name: "GraphEditor",
    props: {
        subgraphId: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            postIdToAddToGraph: null,
            newSubgraphName: ""
        };
    },
    computed: {
        ...mapState("postsModule", ["subgraphs"]),
        ...mapGetters("postsModule", ["postIds", "titleOrBody"]),

        subgraph() {
            return this.subgraphs[this.subgraphId];
        },
    },
    methods: {
        ...mapMutations("postsModule", ["changeSubgraphName", "removeSubgraph"]),
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