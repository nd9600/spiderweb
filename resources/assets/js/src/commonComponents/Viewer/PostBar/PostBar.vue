<template>
    <section>
        <div class="postBar">
            <div class="flex justify-between items-center">
                <span>
                    <button
                        v-if="selectedPostIds.length > 1 && visiblePosts.length !== selectedPostIds.length && !visiblePosts.includes(0)"
                        class="btn btn--secondary"
                        type="button"
                        @click="scrollLeft"
                    >
                        <span class="text-lg">⇐ {{ numberOfPostsHiddenToTheLeft }}</span>
                    </button>
                </span>
                <span>
                    <button
                        v-if="selectedPostIds.length > 1 && visiblePosts.length !== selectedPostIds.length && !visiblePosts.includes(selectedPostIds.length - 1)"
                        class="btn btn--secondary"
                        type="button"
                        @click="scrollRight"
                    >
                        <span class="text-lg">{{ numberOfPostsHiddenToTheRight }} ⇒</span>
                    </button>
                </span>
            </div>
            <div
                id="postBar"
                class="w-full flex items-start overflow-x-hidden"
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
        },

        numberOfPostsHiddenToTheLeft() {
            if (this.visiblePosts.length === 0) {
                return 0;
            }
            return this.visiblePosts[0];
        },
        numberOfPostsHiddenToTheRight() {
            if (this.visiblePosts.length === 0) {
                return 0;
            }
            const lastVisiblePostIndex = this.visiblePosts[this.visiblePosts.length - 1];
            return this.selectedPostIds.length - (lastVisiblePostIndex + 1);
        }
    },
    watch: {
        selectedPostIds: "setVisiblePosts",
    },
    mounted() {
        this.setVisiblePosts();
        document.getElementById("postBar").onscroll = this.setVisiblePosts;
    },
    activated() {
        this.setVisiblePosts();
    },
    methods: {
        ...mapMutations("dataModule", ["setSelectedPostIds"]),

        isPostVisible(element, scrolledThing) {
            // a post is visible if its top left corner and mid point is visible
            if (!element || scrolledThing.scrollLeft == null) {
                return false;
            }

            const bounding = element.getBoundingClientRect();
            const container = scrolledThing.getBoundingClientRect();
            const topLeftIsVisible = bounding.left >= 0
                && bounding.top <= container.bottom
                && bounding.left <= container.right;
            const midpointIsVisible = ((bounding.left + bounding.right) / 2) <= container.right;
            return topLeftIsVisible && midpointIsVisible;
        },
        // todo: misses newly selected posts
        setVisiblePosts() {
            let visiblePosts = [];
            for (let i = 0; i < this.selectedPostIds.length; i++) {
                const postIsVisible = this.isPostVisible(
                    document.getElementById(`post-${i}`),
                    document.getElementById("postBar")
                );
                console.log(i, postIsVisible);
                if (postIsVisible) {
                    visiblePosts.push(i);
                }
            }
            console.log(visiblePosts);
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
    }
};
</script>

<style>
    .postBar {
        min-width: 33%;
        background: #eeeeee url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAR0lEQVQYlYWPuw0AQAhC2X9AY+UOTOBVNH7OgkQpHgDzSJJpHk3ySSZ0SPWXsBFqUiNuZGyEmoSNMBJ/a09i9ceOU1dca/U/VPFxnYht7pgAAAAASUVORK5CYII=");
    }
</style>