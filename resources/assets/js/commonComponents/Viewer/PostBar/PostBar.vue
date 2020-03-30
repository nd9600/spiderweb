<template>
    <div class="w-full flex items-start overflow-x-auto postBar">
        <post
            v-for="selectedPostId in selectedPostIds"
            :key="selectedPostId"
            class="m-2 p-2"
            :post="posts[selectedPostId]"
        >
        </post>
    </div>
</template>

<script>
import Post from "./Post";

import { mapState } from "vuex";


export default {
    name: "PostBar",
    components: {
        Post
    },
    computed: {
        ...mapState("postsModule", ["posts", "selectedPostIds"])
    },
};
</script>

<style>
    .postBar {
        min-width: 33%;
        background: #eeeeee url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAR0lEQVQYlYWPuw0AQAhC2X9AY+UOTOBVNH7OgkQpHgDzSJJpHk3ySSZ0SPWXsBFqUiNuZGyEmoSNMBJ/a09i9ceOU1dca/U/VPFxnYht7pgAAAAASUVORK5CYII=");
    }
</style>