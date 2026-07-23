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
                @click="dataStore.removeSubgraph(subgraphId)"
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
                    @click="dataStore.changeSubgraphColour({subgraphId, colour: newSubgraphColour})"
                >
                    Change subgraph colour
                </button>
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
///// imports /////
import {computed, onMounted, ref} from "vue";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "SubgraphEditor",
});

const props = defineProps<{
    subgraphId: string;
}>();

///// refs and variables /////
const dataStore = useDataStore();
const newSubgraphName = ref("");
const newSubgraphColour = ref("#000000");

///// computed /////
const subgraph = computed(() => dataStore.subgraphs[props.subgraphId]);

///// functions /////
function changeSubgraphNameLocal(): void {
    if (newSubgraphName.value.trim().length === 0) {
        return;
    }

    dataStore.changeSubgraphName({
        subgraphId: props.subgraphId,
        newSubgraphName: newSubgraphName.value
    });
    newSubgraphName.value = "";
}

///// lifecycle /////
onMounted(() => {
    newSubgraphColour.value = subgraph.value.colour || "#000000";
});
</script>
