<template>
    <section>
        <div class="postBar">
            <div class="flex justify-between items-center">
                <span>
                    <button
                        v-if="!visiblePosts.includes(0)"
                        class="btn btn--secondary"
                        type="button"
                        @click="scrollLeft"
                    >
                        <span class="text-2xl">⇐</span>
                    </button>
                </span>
                <span>
                    <button
                        v-if="!visiblePosts.includes(selectedPostIds.length - 1)"
                        class="btn btn--secondary"
                        type="button"
                        @click="scrollRight"
                    >
                        <span class="text-2xl">⇒</span>
                    </button>
                </span>
            </div>
            <div
                id="postBar"
                class="w-full flex items-start overflow-x-auto"
            >
                <post
                    v-for="(selectedPostId, i) in selectedPostIds"
                    :id="`post-${i}`"
                    :key="selectedPostId"
                    class="m-2 p-2"
                    :post="posts[selectedPostId]"
                >
                </post>
            </div>
        </div>
    </section>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import elementIsVisible from "@/js/helpers/elementIsVisible.js";

import Post from "./Post";

export default {
    name: "PostBar",
    components: {
        Post,
    },
    data() {
        return {
            visiblePosts: []
        };
    },
    computed: {
        ...mapState("dataModule", ["posts"]),
        selectedPostIds: {
            get() {
                return this.$store.state.dataModule.selectedPostIds;
            },
            set(selectedPostIds) {
                this.setSelectedPostIds(selectedPostIds);
            }
        }
    },
    mounted() {
        this.setVisiblePosts();
        document.getElementById("postBar").onscroll = this.setVisiblePosts;
    },
    methods: {
        ...mapMutations("dataModule", ["setSelectedPostIds"]),

        setVisiblePosts() {
            let visiblePosts = [];
            for (let i = 0; i < this.selectedPostIds.length; i++) {
                const postIsVisible = elementIsVisible(
                    document.getElementById(`post-${i}`),
                    document.getElementById("postBar")
                );
                if (postIsVisible) {
                    visiblePosts.push(i);
                }
            }
            this.visiblePosts = visiblePosts;
        },
        scrollLeft() {
            const postIdToScrollTo = this.visiblePosts[0] - 1;
            const postToScrollTo = document.getElementById(`post-${postIdToScrollTo}`);

            const bounding = postToScrollTo.getBoundingClientRect();
            let postBar = document.getElementById("postBar");
            let container = postBar.getBoundingClientRect();

            postBar.scrollLeft = postBar.scrollLeft - (Math.abs(bounding.left) + container.left + 10);
        },
        scrollRight() {
            const postIdToScrollTo = this.visiblePosts[this.visiblePosts.length - 1] + 1;
            const postToScrollTo = document.getElementById(`post-${postIdToScrollTo}`);

            const bounding = postToScrollTo.getBoundingClientRect();
            let postBar = document.getElementById("postBar");
            let container = postBar.getBoundingClientRect();

            postBar.scrollLeft = postBar.scrollLeft + (bounding.right - container.right + 10);
        }
    },
};
</script>

<style>
    .postBar {
        min-width: 33%;
        background: #eeeeee url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAR0lEQVQYlYWPuw0AQAhC2X9AY+UOTOBVNH7OgkQpHgDzSJJpHk3ySSZ0SPWXsBFqUiNuZGyEmoSNMBJ/a09i9ceOU1dca/U/VPFxnYht7pgAAAAASUVORK5CYII=");
    }
</style>