<template>
    <div class="flex flex-col">
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
                v-for="(graph, graphId) in dataStore.graphs"
                :key="graphId"
                :graphId="graphId"
                class="m-4 p-4 border border-gray-500"
            />
        </section>
    </div>
</template>

<script setup lang="ts">
///// imports /////
import {ref} from "vue";
import GraphEditor from "./GraphEditor.vue";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "TheGraphs",
});

///// refs and variables /////
const dataStore = useDataStore();
const newGraphName = ref("");

///// functions /////
function makeNewGraphLocal(): void {
    dataStore.makeNewGraph(newGraphName.value);
    newGraphName.value = "";
}
</script>
