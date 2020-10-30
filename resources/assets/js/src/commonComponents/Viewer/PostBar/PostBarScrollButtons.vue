<template>
    <div class="flex justify-between items-center">
        <span>
            <button
                v-if="visiblePosts.length !== selectedPostIds.length && !visiblePosts.includes(0)"
                class="btn btn--secondary"
                type="button"
                @click="scrollLeft"
            >
                <span class="text-lg">⇐ {{ numberOfPostsHiddenToTheLeft }}</span>
            </button>
        </span>
        <span>
            <button
                v-if="visiblePosts.length !== selectedPostIds.length && !visiblePosts.includes(selectedPostIds.length - 1)"
                class="btn btn--secondary"
                type="button"
                @click="scrollRight"
            >
                <span class="text-lg">{{ numberOfPostsHiddenToTheRight }} ⇒</span>
            </button>
        </span>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "PostBarScrollButtons",
    data() {
        return {
            visiblePosts: []
        };
    },
    computed: {
        ...mapState("dataModule", ["selectedPostIds"]),

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