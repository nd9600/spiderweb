<template>
    <div class="flex overflow-x-auto postSidebar">
        <post
            v-for="selectedPostId in selectedPostIds"
            :key="selectedPostId"
            class="m-2 py-2 pl-2"
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
        background: #eeeeee url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAR0lEQVQYlYWPuw0AQAhC2X9AY+UOTOBVNH7OgkQpHgDzSJJpHk3ySSZ0SPWXsBFqUiNuZGyEmoSNMBJ/a09i9ceOU1dca/U/VPFxnYht7pgAAAAASUVORK5CYII=");
    }
</style>