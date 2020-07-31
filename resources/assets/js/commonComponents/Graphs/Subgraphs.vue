<template>
    <div class="flex flex-col">
        <h1 class="h h--1">
            Subgraphs
        </h1>

        <hr class="my-5">

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

        <section>
            <h2 class="h h--2">
                Edit subgraphs
            </h2>

            <SubgraphEditor
                v-for="(subgraph, subgraphId) in subgraphs"
                :key="subgraphId"
                :subgraphId="subgraphId"
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
