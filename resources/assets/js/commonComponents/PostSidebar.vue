<template>
    <div class="flex overflow-x-auto postSidebar">
        <post
            v-for="selectedPostId in selectedPostIds"
            :key="selectedPostId"
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
        ...mapState("postsModule", ["posts", "selectedPostIds"])
    },
};
</script>

<style>
    .postSidebar {
        min-width: 33%;
    }

    .post {
        min-width: 90%;
        width: 90%;
        max-height: 66vh;

        overflow-y: auto;
    }
    @media(min-width: 768px) {
        .post {
            min-width: 50%;
            width: 50%;
        }
    }

    .post:not(:last-of-type) {
        border-right: 1px solid #333;
    }
</style>