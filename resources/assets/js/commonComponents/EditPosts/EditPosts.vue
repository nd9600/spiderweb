<template>
    <div class="flex flex-col">
        <post-maker/>

        <h2 class="h h--2">
            Edit posts
        </h2>
        <post-editor
            v-for="post in posts"
            :key="post.id"
            :post="post"
        />
    </div>
</template>

<script>
import PostMaker from "./PostMaker";
import PostEditor from "./PostEditor";

import { mapState } from "vuex";

export default {
    name: "EditPosts",
    components: {
        PostMaker,
        PostEditor,
    },
    computed: {
        ...mapState("postsModule", ["posts"]),
    }
};
</script>

<style scoped>

</style>