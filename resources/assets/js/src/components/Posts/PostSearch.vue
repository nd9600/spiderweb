<template>
    <div>
        <label>
            <input
                ref="searchInput"
                v-model="searchTerm"
                class="p-2 w-full input input--primary"
                type="text"
                placeholder="On the Origin of Species"
                minlength="0"
                maxlength="50"
                title="search for a post"
            />
        </label>
        <div
            v-if="isLoadingSearchResults"
            class="mt-1 flex justify-center items-center"
        >
            <div class="spinner"></div>
        </div>
        <div v-else-if="searchResults.length > 0">
            <div
                v-for="post in searchResults"
                :key="post.id"
                class="mt-2 p-1 cursor-pointer bg-red-200 hover:bg-red-300 rounded-lg"
                @click="emit('clickedOnResult', post)"
            >
                <span
                    v-if="post.title.length > 0"
                    class="font-bold"
                >
                    {{ post.title }}
                </span>
                <p
                    v-if="post.body.length > 0"
                    class="text-xs"
                >
                    {{ post.body.substr(0, 200) }}{{ post.body.length > 200 ? "..." : "" }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
///// imports /////
import {onMounted, ref, useTemplateRef, watch} from "vue";
import type {Post} from "@/src/store/models/Post";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "PostSearch",
});

const emit = defineEmits<{
    clickedOnResult: [post: Post];
}>();

///// refs and variables /////
const dataStore = useDataStore();
const searchInput = useTemplateRef<HTMLInputElement>("searchInput");
const searchTerm = ref("");
const isLoadingSearchResults = ref(false);
const searchResults = ref<Post[]>([]);

///// watchers /////
watch(searchTerm, (newSearchTerm) => {
    const searchTermToFind = newSearchTerm.trim().toLowerCase();
    if (searchTermToFind.length === 0) {
        searchResults.value = [];
        isLoadingSearchResults.value = false;
        return;
    }
    isLoadingSearchResults.value = true;

    searchResults.value = Object.values(dataStore.posts)
        .filter((post) => {
            return post.title.toLowerCase().includes(searchTermToFind)
                || post.body.toLowerCase().includes(searchTermToFind);
        })
        .sort((postA, postB) => {
            const postAStringToCompare = postA.title.length > 0
                ? postA.title
                : postA.body;
            const postBStringToCompare = postB.title.length > 0
                ? postB.title
                : postB.body;

            if (postAStringToCompare < postBStringToCompare) {
                return -1;
            } else if (postBStringToCompare < postAStringToCompare) {
                return 1;
            } else {
                return 0;
            }
        })
        .slice(0, 25);
    isLoadingSearchResults.value = false;
});

///// lifecycle /////
onMounted(() => {
    searchInput.value?.focus();
});
</script>
