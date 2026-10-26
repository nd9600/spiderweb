<template>
    <section ref="postBarElement">
        <div
            id="postBar"
            class="postBar"
        >
            <PostBarScrollButtons @scrollToTop="emit('scrollToTop')" />
            <div
                id="postsContainer"
                class="w-full flex items-start overflow-x-auto"
            >
                <Post
                    v-for="(post, i) in selectedPosts"
                    :id="`post-${i}`"
                    :key="post.id"
                    class="m-2 p-2"
                    :post="post"
                    @focusPost="emit('focusPost', $event)"
                    @highlightPost="emit('highlightPost', $event)"
                    @unhighlightPost="emit('unhighlightPost', $event)"
                >
                </Post>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
///// imports /////
import {computed, useTemplateRef} from "vue";
import type {PostId} from "@/src/@types/StoreTypes";
import Post from "./Post.vue";
import PostBarScrollButtons from "./PostBarScrollButtons.vue";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "PostBar",
});

const emit = defineEmits<{
    focusPost: [postId: PostId];
    highlightPost: [postId: PostId];
    unhighlightPost: [postId: PostId];
    scrollToTop: [];
}>();

///// refs and variables /////
const dataStore = useDataStore();
// Firebase delivers posts and selection updates separately during a remote deletion.
const selectedPosts = computed(() => dataStore.selectedPostIds
    .map((postId) => dataStore.posts[postId])
    .filter((post) => post != null));
const postBarElement = useTemplateRef<HTMLElement>("postBarElement");

///// functions /////
function scrollToPostBar(): void {
    if (postBarElement.value == null) {
        return;
    }

    window.scrollBy(0, postBarElement.value.getBoundingClientRect().top - 5);
}

defineExpose({
    scrollToPostBar,
});
</script>

<style>
    .postBar {
        min-width: 33%;
        background: #eeeeee url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAR0lEQVQYlYWPuw0AQAhC2X9AY+UOTOBVNH7OgkQpHgDzSJJpHk3ySSZ0SPWXsBFqUiNuZGyEmoSNMBJ/a09i9ceOU1dca/U/VPFxnYht7pgAAAAASUVORK5CYII=");
    }
</style>
