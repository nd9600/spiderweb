<template>
    <div class="flex justify-between items-center">
        <span>
            <button
                class="btn btn--secondary"
                type="button"
                :disabled="numberOfPostsHiddenToTheLeft === 0 || visiblePosts.length === selectedPostIds.length || visiblePosts.includes(0)"
                @click="scrollLeft"
            >
                <span class="text-lg">⇐ {{ numberOfPostsHiddenToTheLeft }}</span>
            </button>

            <button
                class="btn btn--secondary mt-4 ml-2"
                type="button"
                title="scroll to the top of the page"
                @click="scrollToTop"
            >
                ↥
            </button>
        </span>
        <span>
            <button
                class="btn btn--secondary"
                type="button"
                :disabled="numberOfPostsHiddenToTheRight === 0 || visiblePosts.length === selectedPostIds.length && visiblePosts.includes(selectedPostIds.length - 1)"
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
            visiblePosts: [],
            postsWithVisibleSecondHalves: []
        };
    },
    computed: {
        ...mapState("dataModule", ["selectedPostIds"]),

        numberOfPostsHiddenToTheLeft() {
            if (this.visiblePosts.length === 0) {
                if (this.postsWithVisibleSecondHalves.length === 0) {
                    return 0;
                }

                const firstKindaVisiblePostIndex = this.postsWithVisibleSecondHalves[0];
                return firstKindaVisiblePostIndex + 1;
            }
            return this.visiblePosts[0];
        },
        numberOfPostsHiddenToTheRight() {
            if (this.visiblePosts.length === 0) {
                if (this.postsWithVisibleSecondHalves.length === 0) {
                    return 0;
                }

                const firstKindaVisiblePostIndex = this.postsWithVisibleSecondHalves[0];
                return this.selectedPostIds.length - (firstKindaVisiblePostIndex + 1);
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

            const postDimensions = element.getBoundingClientRect();
            const container = scrolledThing.getBoundingClientRect();
            const topLeftIsVisible = postDimensions.left >= 0
                && postDimensions.top <= container.bottom
                && postDimensions.left <= container.right;
            const midpointIsVisible = ((postDimensions.left + postDimensions.right) / 2) <= container.right;
            return topLeftIsVisible && midpointIsVisible;
        },
        isPostSecondHalfVisible(element, scrolledThing) {
            // a post's second half is visible if its top right corner and mid point is visible
            if (!element || scrolledThing.scrollLeft == null) {
                return false;
            }

            const postDimensions = element.getBoundingClientRect();
            const container = scrolledThing.getBoundingClientRect();
            const topRightIsVisible = postDimensions.right >= 0
                && postDimensions.top <= container.bottom
                && postDimensions.right <= container.right;
            const midpointIsVisible = ((postDimensions.left + postDimensions.right) / 2) <= container.right;
            return topRightIsVisible && midpointIsVisible;
        },
        setVisiblePosts() {
            let visiblePosts = [];
            let postsWithVisibleSecondHalves = [];

            const postBarElement = document.getElementById("postBar");

            for (let i = 0; i < this.selectedPostIds.length; i++) {
                const postElement = document.getElementById(`post-${i}`);
                const postIsVisible = this.isPostVisible(
                    postElement,
                    postBarElement
                );
                if (postIsVisible) {
                    visiblePosts.push(i);
                } else {
                    // if we just use visiblePosts, sometimes no posts will be visible, depending on what the minPostWidth is
                    const postSecondHalfIsVisible = this.isPostSecondHalfVisible(
                        postElement,
                        postBarElement
                    );
                    if (postSecondHalfIsVisible) {
                        postsWithVisibleSecondHalves.push(i);
                    }
                }
            }

            this.visiblePosts = visiblePosts;
            this.postsWithVisibleSecondHalves = postsWithVisibleSecondHalves;
        },
        scrollLeft() {
            let postIdToScrollTo;
            if (this.visiblePosts.length === 0) {
                const firstKindaVisiblePostIndex = this.postsWithVisibleSecondHalves[0];
                postIdToScrollTo = firstKindaVisiblePostIndex;
            } else {
                postIdToScrollTo = this.visiblePosts[0] - 1;
            }

            const postToScrollTo = document.getElementById(`post-${postIdToScrollTo}`);

            const postDimensions = postToScrollTo.getBoundingClientRect();
            let postBar = document.getElementById("postBar");
            let container = postBar.getBoundingClientRect();

            postBar.scrollLeft = postBar.scrollLeft - (Math.abs(postDimensions.left) + container.left + 10);
        },
        scrollRight() {
            let postIdToScrollTo;
            if (this.visiblePosts.length === 0) {
                const firstKindaVisiblePostIndex = this.postsWithVisibleSecondHalves[0];
                postIdToScrollTo = firstKindaVisiblePostIndex + 1;
            } else {
                postIdToScrollTo = this.visiblePosts[this.visiblePosts.length - 1] + 1;
            }

            const postToScrollTo = document.getElementById(`post-${postIdToScrollTo}`);

            const postDimensions = postToScrollTo.getBoundingClientRect();
            let postBar = document.getElementById("postBar");
            let container = postBar.getBoundingClientRect();

            postBar.scrollLeft = postBar.scrollLeft + (postDimensions.right - container.right + 10);
        },

        scrollToTop() {
            window.scrollTo(0, 0);
        }
    }
};
</script>