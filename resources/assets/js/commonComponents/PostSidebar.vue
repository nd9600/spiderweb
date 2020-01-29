<template>
    <div class="flex overflow-x-auto postSidebar">
        <post
            v-if="selectedPostId !== null"
            class="mr-4 py-2 pl-2 post"
            :post="posts[selectedPostId]"
        >
        </post>
    </div>
</template>

<script>
import Post from "@/js/commonComponents/Post";

import { mapState } from "vuex";


export default {
    name: "PostSidebar",
    components: {
        Post
    },
    computed: {
        ...mapState("postsModule", ["posts", "selectedPostId"])
    }
};
</script>

<style>
    .postSidebar {
        min-width: 33%;
    }

    .post {
        min-width: 50%;
        width: 50%;
        max-height: 50vw;

        overflow-y: auto;
    }
    .post:not(:last-of-type) {
        border-right: 1px solid #333;
    }
</style>