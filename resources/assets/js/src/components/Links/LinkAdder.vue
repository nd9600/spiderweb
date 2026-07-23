<template>
    <div>
        <label class="mb-4">
            The new link will be a
            <select
                v-model="clickerStore.newLinkType"
                class="select select--secondary mb-2"
            >
                <option value="reply">
                    reply
                </option>
                <option value="sidenote">
                    sidenote
                </option>
                <option value="link">
                    link
                </option>
            </select>
            <template v-if="subgraphsInSelectedGraph.length > 0">
                in the subgraphs ({{ clickerStore.newLinkSubgraphIds.length }})
                <select
                    v-model="clickerStore.newLinkSubgraphIds"
                    class="select select--secondary max-w-full"
                    :size="Math.min(subgraphsInSelectedGraph.length, 3)"
                    multiple
                >
                    <option
                        v-for="subgraph in subgraphsInSelectedGraph"
                        :key="subgraph.id"
                        :value="subgraph.id"
                        class="truncate"
                    >
                        {{ subgraph.name }}
                    </option>
                </select>
            </template>
        </label>

        <label
            v-if="clickerStore.newLinkSource != null"
            class="mt-4 pt-4 block"
            style="border-top: 1px solid var(--red)"
        >
            It'll be from
            <span class="inline-block">
                <span class="text-red">{{ dataStore.titleOrBody(clickerStore.newLinkSource) }}</span>
                →
            </span>

            <PostSearch
                class="ml-2"
                @clickedOnResult="clickerStore.handlePostClick($event)"
            />

            <div class="my-2 flex justify-between">
                <p class="text-xs text-gray-500">
                    search for a post's title/body, or click on a post
                </p>

                <button
                    class="btn btn--secondary"
                    type="button"
                    :disabled="clickerStore.newLinkSource == null"
                    title="remove this source"
                    @click="clickerStore.newLinkSource = null"
                >
                    x
                </button>
            </div>
        </label>
        <p
            v-else
            class="mt-4 text-xs text-gray-500"
        >
            click on a post to pick the link's source
        </p>
    </div>
</template>

<script setup lang="ts">
///// imports /////
import {computed} from "vue";
import PostSearch from "@/src/components/Posts/PostSearch.vue";
import {useClickerStore, useDataStore} from "@/src/store";

defineOptions({
    name: "LinkAdder",
});

///// refs and variables /////
const dataStore = useDataStore();
const clickerStore = useClickerStore();

///// computed /////
const subgraphsInSelectedGraph = computed(() => {
    if (dataStore.selectedGraphId == null) {
        return [];
    }

    return dataStore.subgraphIndexes.subgraphsByGraphId[dataStore.selectedGraphId] ?? [];
});
</script>
