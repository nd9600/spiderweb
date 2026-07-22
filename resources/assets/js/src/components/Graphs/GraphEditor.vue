<template>
    <div>
        <div class="flex justify-between">
            <h3 class="h h--3">
                {{ graph.name }}
            </h3>
            <button
                v-if="graphId !== '1'"
                class="py-1 px-2 btn btn--secondary"
                @click="dataStore.removeGraph(graphId)"
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

<script setup lang="ts">
///// imports /////
import {computed, ref} from "vue";
import Subgraphs from "./Subgraphs.vue";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "GraphEditor",
});

const props = defineProps<{
    graphId: string;
}>();

///// refs and variables /////
const dataStore = useDataStore();
const newGraphName = ref("");

///// computed /////
const graph = computed(() => dataStore.graphs[props.graphId]);

///// functions /////
function changeGraphNameLocal(): void {
    if (newGraphName.value.trim().length === 0) {
        return;
    }

    dataStore.changeGraphName({
        graphId: props.graphId,
        newGraphName: newGraphName.value
    });
    newGraphName.value = "";
}
</script>
