<template>
    <div class="flex flex-col">
        <post-maker/>

        <hr class="mb-5">

        <div>
            <span class="mb-5 flex justify-between items-center">
                <h2 class="h h--2">
                    Edit posts
                </h2>
                
                <button
                    v-if="Object.keys(posts).length > 0"
                    class="btn btn--secondary"
                    @click="shouldShowEditors = !shouldShowEditors"
                >
                    {{ shouldShowEditors ? "Hide" : "Show" }} editors
                </button>
            </span>
            <template v-if="shouldShowEditors">
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
            shouldShowEditors: false
        };
    },
    computed: {
        ...mapState("postsModule", ["posts"]),
    }
};
</script>

<style scoped>

</style>