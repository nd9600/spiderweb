<template>
    <div class="p-4 h-full flex overflow-x-auto postSidebar">
        <post
            v-if="selectedPostId !== null"
            class="min-w-full"
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
</style>