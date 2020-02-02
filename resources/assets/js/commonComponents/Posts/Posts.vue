<template>
    <div class="flex flex-col">
        <post-maker/>

        <hr class="mb-5">

        <div>
            <button
                v-if="Object.keys(posts).length > 0"
                class="mb-5 btn btn--secondary"
                @click="shouldShowPosts = !shouldShowPosts"
            >
                {{ shouldShowPosts ? "Hide" : "Show" }} editors
            </button>

            <template v-if="shouldShowPosts">
                <h2 class="h h--2">
                    Edit posts
                </h2>
                <post-editor
                    v-for="post in posts"
                    :key="post.id"
                    :post="post"
                />
            </template>
        </div>

        <hr class="mb-5">
    </div>
</template>

<script>
import PostMaker from "./PostMaker";
import PostEditor from "./PostEditor";

import { mapState } from "vuex";

export default {
    name: "Posts",
    components: {
        PostMaker,
        PostEditor,
    },
    data() {
        return {
            shouldShowPosts: false
        };
    },
    computed: {
        ...mapState("postsModule", ["posts"]),
    }
};
</script>

<style scoped>

</style>