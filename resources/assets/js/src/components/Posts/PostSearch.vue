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
        <div v-if="searchResults.length > 0">
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
                    {{ post.body.substring(0, 200) }}{{ post.body.length > 200 ? "..." : "" }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
///// imports /////
import debounce from "lodash/debounce";
import {computed, onMounted, ref, useTemplateRef, watch} from "vue";
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
const searchResults = ref<Post[]>([]);

///// computed /////
const searchablePosts = computed(() => Object.values(dataStore.posts)
    .map((post) => ({
        post,
        searchableTitle: post.title.toLowerCase(),
        searchableBody: post.body.toLowerCase(),
        sortText: post.title.length > 0
            ? post.title
            : post.body,
    }))
    .sort((postA, postB) => {
        if (postA.sortText < postB.sortText) {
            return -1;
        } else if (postB.sortText < postA.sortText) {
            return 1;
        } else {
            return 0;
        }
    }));

///// functions /////
const updateSearchResults = debounce(() => {
    const searchTermToFind = searchTerm.value.trim().toLowerCase();
    if (searchTermToFind.length === 0) {
        searchResults.value = [];
        return;
    }

    searchResults.value = searchablePosts.value
        .filter((searchablePost) => {
            return searchablePost.searchableTitle.includes(searchTermToFind)
                || searchablePost.searchableBody.includes(searchTermToFind);
        })
        .slice(0, 25)
        .map((searchablePost) => searchablePost.post);
}, 100);

///// watchers /////
watch([searchTerm, searchablePosts], () => {
    if (searchTerm.value.trim().length === 0) {
        searchResults.value = [];
        return;
    }

    updateSearchResults();
});

///// lifecycle /////
onMounted(() => {
    searchInput.value?.focus();
});
</script>
