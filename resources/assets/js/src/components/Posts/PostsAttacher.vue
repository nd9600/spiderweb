<template>
    <div>
        <section
            v-if="dataStore.unattachedPosts.length > 0"
            class="w-full mb-4 border-b border-red-500"
        >
            <h4 class="h h--4">
                Posts that haven't been attached to any graph yet
            </h4>

            <PostAttacher
                v-for="post in dataStore.unattachedPosts"
                :key="post.id"
                :post="post"
            />
        </section>
        <section class="mb-4">
            <h4 class="h h--4">
                Search for posts
            </h4>
            <PostSearch
                class="ml-2"
                @clickedOnResult="onPostClick($event)"
            />
        </section>
        <section
            v-if="postToAttach !== null"
        >
            <h4 class="h h--4">
                Attach post
            </h4>
            <PostAttacher
                :post="postToAttach"
                :initialShouldExpand="true"
                @attachedPost="postToAttach = null"
            />
        </section>
    </div>
</template>

<script setup lang="ts">
///// imports /////
import {ref} from "vue";
import type {Post} from "@/src/store/models/Post";

import PostAttacher from "./PostAttacher.vue";
import PostSearch from "@/src/components/Posts/PostSearch.vue";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "PostsAttacher",
});

///// refs and variables /////
const dataStore = useDataStore();
const postToAttach = ref<Post | null>(null);

///// functions /////
function onPostClick(post: Post): void {
    if (
        postToAttach.value === null
        || postToAttach.value.id !== post.id
    ) {
        postToAttach.value = post;
    } else {
        postToAttach.value = null;
    }
}
</script>
