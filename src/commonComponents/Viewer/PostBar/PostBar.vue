<template>
    <section>
        <div
            id="postBar"
            class="postBar"
        >
            <PostBarScrollButtons />
            <div
                id="postsContainer"
                class="w-full flex items-start overflow-x-auto"
            >
                <PostItem
                    v-for="(selectedPostId, i) in selectedPostIds"
                    :id="`post-${i}`"
                    :key="selectedPostId"
                    class="m-2 p-2"
                    :post="posts[selectedPostId]"
                >
                </PostItem>
            </div>
        </div>
    </section>
</template>

<script>
import { defineComponent } from "vue";

import { mapState } from "vuex";

import PostItem from "./PostItem.vue";
import PostBarScrollButtons from "./PostBarScrollButtons.vue";

export default defineComponent({
    name: "PostBar",

    components: {
        PostItem,
        PostBarScrollButtons
    },

    computed: {
        ...mapState("dataModule", ["posts", "selectedPostIds"]),
    },
});
</script>

<style>
    .postBar {
        min-width: 33%;
        background: #eeeeee url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAR0lEQVQYlYWPuw0AQAhC2X9AY+UOTOBVNH7OgkQpHgDzSJJpHk3ySSZ0SPWXsBFqUiNuZGyEmoSNMBJ/a09i9ceOU1dca/U/VPFxnYht7pgAAAAASUVORK5CYII=");
    }
</style>