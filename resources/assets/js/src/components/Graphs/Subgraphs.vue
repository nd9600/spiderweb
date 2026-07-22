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

<script setup lang="ts">
///// imports /////
import {computed, ref} from "vue";
import SubgraphEditor from "./SubgraphEditor.vue";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "GraphSubgraphs",
});

const props = defineProps<{
    graphId: string;
}>();

///// refs and variables /////
const dataStore = useDataStore();
const newSubgraphName = ref("");

///// computed /////
const subgraphsInGraph = computed(() => Object.values(dataStore.subgraphs)
    .filter((subgraph) => subgraph.graph === props.graphId));

///// functions /////
function makeNewSubgraphLocal(): void {
    dataStore.makeNewSubgraph({
        graphId: props.graphId,
        newSubgraphName: newSubgraphName.value
    });
    newSubgraphName.value = "";
}
</script>
