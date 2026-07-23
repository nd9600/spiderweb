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
                @click="emit('scrollToTop')"
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

<script setup lang="ts">
///// imports /////
import {computed, nextTick, onActivated, onBeforeUnmount, ref, watch} from "vue";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "PostBarScrollButtons",
});

///// props/emits /////
const emit = defineEmits<{
    scrollToTop: [];
}>();

///// refs and variables /////
const dataStore = useDataStore();
const visiblePosts = ref<number[]>([]);
const postsWithVisibleSecondHalves = ref<number[]>([]);

///// computed /////
const selectedPostIds = computed(() => dataStore.selectedPostIds);

const numberOfPostsHiddenToTheLeft = computed(() => {
    if (visiblePosts.value.length === 0) {
        if (postsWithVisibleSecondHalves.value.length === 0) {
            return 0;
        }

        const firstKindaVisiblePostIndex = postsWithVisibleSecondHalves.value[0];
        return firstKindaVisiblePostIndex + 1;
    }
    return visiblePosts.value[0];
});

const numberOfPostsHiddenToTheRight = computed(() => {
    if (visiblePosts.value.length === 0) {
        if (postsWithVisibleSecondHalves.value.length === 0) {
            return 0;
        }

        const firstKindaVisiblePostIndex = postsWithVisibleSecondHalves.value[0];
        return selectedPostIds.value.length - (firstKindaVisiblePostIndex + 1);
    }
    const lastVisiblePostIndex = visiblePosts.value[visiblePosts.value.length - 1];
    return selectedPostIds.value.length - (lastVisiblePostIndex + 1);
});

///// functions /////
function isPostVisible(element: Nullable<HTMLElement>, scrolledThing: Nullable<HTMLElement>): boolean {
    // A post is visible if its top-left corner and midpoint are visible.
    if (element == null || scrolledThing == null || scrolledThing.scrollLeft == null) {
        return false;
    }

    const postDimensions = element.getBoundingClientRect();
    const container = scrolledThing.getBoundingClientRect();
    const topLeftIsVisible = postDimensions.left >= 0
        && postDimensions.top <= container.bottom
        && postDimensions.left <= container.right;
    const midpointIsVisible = ((postDimensions.left + postDimensions.right) / 2) <= container.right;
    return topLeftIsVisible && midpointIsVisible;
}

function isPostSecondHalfVisible(element: Nullable<HTMLElement>, scrolledThing: Nullable<HTMLElement>): boolean {
    // A post's second half is visible if its top-right corner and midpoint are visible.
    if (element == null || scrolledThing == null || scrolledThing.scrollLeft == null) {
        return false;
    }

    const postDimensions = element.getBoundingClientRect();
    const container = scrolledThing.getBoundingClientRect();
    const topRightIsVisible = postDimensions.right >= 0
        && postDimensions.top <= container.bottom
        && postDimensions.right <= container.right;
    const midpointIsVisible = ((postDimensions.left + postDimensions.right) / 2) <= container.right;
    return topRightIsVisible && midpointIsVisible;
}

function setVisiblePosts(): void {
    const nextVisiblePosts: number[] = [];
    const nextPostsWithVisibleSecondHalves: number[] = [];
    const postsContainerElement = document.getElementById("postsContainer");

    for (let i = 0; i < selectedPostIds.value.length; i++) {
        const postElement = document.getElementById(`post-${i}`);
        const postIsVisible = isPostVisible(
            postElement,
            postsContainerElement
        );
        if (postIsVisible) {
            nextVisiblePosts.push(i);
        } else {
            const postSecondHalfIsVisible = isPostSecondHalfVisible(
                postElement,
                postsContainerElement
            );
            if (postSecondHalfIsVisible) {
                nextPostsWithVisibleSecondHalves.push(i);
            }
        }
    }

    visiblePosts.value = nextVisiblePosts;
    postsWithVisibleSecondHalves.value = nextPostsWithVisibleSecondHalves;
}

function scrollLeft(): void {
    const postIndexToScrollTo = visiblePosts.value.length === 0
        ? postsWithVisibleSecondHalves.value[0]
        : visiblePosts.value[0] - 1;
    const postToScrollTo = document.getElementById(`post-${postIndexToScrollTo}`);
    const postsContainer = document.getElementById("postsContainer");
    if (postToScrollTo == null || postsContainer == null) {
        return;
    }

    const postDimensions = postToScrollTo.getBoundingClientRect();
    const container = postsContainer.getBoundingClientRect();
    postsContainer.scrollLeft = postsContainer.scrollLeft - (Math.abs(postDimensions.left) + container.left + 10);
}

function scrollRight(): void {
    const postIndexToScrollTo = visiblePosts.value.length === 0
        ? postsWithVisibleSecondHalves.value[0] + 1
        : visiblePosts.value[visiblePosts.value.length - 1] + 1;
    const postToScrollTo = document.getElementById(`post-${postIndexToScrollTo}`);
    const postsContainer = document.getElementById("postsContainer");
    if (postToScrollTo == null || postsContainer == null) {
        return;
    }

    const postDimensions = postToScrollTo.getBoundingClientRect();
    const container = postsContainer.getBoundingClientRect();
    postsContainer.scrollLeft = postsContainer.scrollLeft + (postDimensions.right - container.right + 10);
}

function queueVisiblePostUpdate(): void {
    void nextTick(() => {
        setVisiblePosts();
    });
}

///// watchers /////
watch(selectedPostIds, queueVisiblePostUpdate, {flush: "post"});

///// lifecycle /////
onActivated(queueVisiblePostUpdate);
void nextTick(() => {
    const postsContainer = document.getElementById("postsContainer");
    postsContainer?.addEventListener("scroll", setVisiblePosts, {passive: true});
    setVisiblePosts();
});
onBeforeUnmount(() => {
    document.getElementById("postsContainer")?.removeEventListener("scroll", setVisiblePosts);
});
</script>
