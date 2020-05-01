<template>
    <section>
        <VueDraggable
            id="postBar"
            v-model="selectedPostIds"
            class="w-full flex items-start overflow-x-auto postBar"
            :handle="'.post__dragHandle'"
        >
            <post
                v-for="selectedPostId in selectedPostIds"
                :key="selectedPostId"
                class="m-2 p-2"
                :post="posts[selectedPostId]"
            >
            </post>
        </VueDraggable>
    </section>
</template>

<script>
import Post from "./Post";
import VueDraggable from "vuedraggable";

import { mapState, mapMutations } from "vuex";


export default {
    name: "PostBar",
    components: {
        Post,
        VueDraggable
    },
    computed: {
        ...mapState("postsModule", ["posts"]),
        selectedPostIds: {
            get() {
                return this.$store.state.postsModule.selectedPostIds;
            },
            set(selectedPostIds) {
                this.setSelectedPostIds(selectedPostIds);
            }
        }
    },
    methods: {
        ...mapMutations("postsModule", ["setSelectedPostIds"])
    },
};
</script>

<style>
    .postBar {
        min-width: 33%;
        background: #eeeeee url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAR0lEQVQYlYWPuw0AQAhC2X9AY+UOTOBVNH7OgkQpHgDzSJJpHk3ySSZ0SPWXsBFqUiNuZGyEmoSNMBJ/a09i9ceOU1dca/U/VPFxnYht7pgAAAAASUVORK5CYII=");
    }
</style>