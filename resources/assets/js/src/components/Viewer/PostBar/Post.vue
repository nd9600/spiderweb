<template>
    <section
        class="relative post"
        :style="{
            'min-width': minPostWidth + 'vw'
        }"
    >
        <div>
            <div class="flex justify-between">
                <div>
                    <h3
                        v-if="post.title.length > 0"
                        class="h h--3 mr-2 whitespace-pre-wrap"
                        :data-post-id="post.id"
                    >
                        <button
                            v-if="isVisibleInGraph"
                            class="focusButton mr-2"
                            type="button"
                            title="focus on this post in the viewer above"
                            @click="emit('focusPost', post.id)"
                            @mouseover="emit('highlightPost', post.id)"
                            @mouseout="emit('unhighlightPost', post.id)"
                        >
                            <span class="text-base">&#128269;</span>
                        </button>{{ post.title }}
                    </h3>
                    <span v-else> </span> <!-- exists so that the icons will always be at the end -->
                </div>
                <span style="min-width: 48px;">
                    <button
                        type="button"
                        :class="{
                            'opacity-25 hover:opacity-100': !showPostEditor,
                            'opacity-100 hover:opacity-25': showPostEditor,
                        }"
                        class="mr-2 transition-150"
                        @click="showPostEditor = !showPostEditor"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 14 16"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M0 12v3h3l8-8-3-3-8 8zm3 2H1v-2h1v1h1v1zm10.3-9.3L12 6 9 3l1.3-1.3a.996.996 0 011.41 0l1.59 1.59c.39.39.39 1.02 0 1.41z"
                            >
                            </path>
                        </svg>
                    </button>
                    <button
                        type="button"
                        class="opacity-25 hover:opacity-100 transition-150"
                        @click="dataStore.unselectPostId(post.id)"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 128 128"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M65.086 75.41l-50.113 50.113c-3.121 3.121-8.192 3.126-11.316.002-3.118-3.118-3.123-8.19.002-11.316l50.114-50.114L3.659 13.982C.538 10.86.533 5.79 3.657 2.666c3.118-3.118 8.19-3.123 11.316.002l50.113 50.114L115.2 2.668c3.121-3.121 8.192-3.126 11.316-.002 3.118 3.118 3.123 8.19-.002 11.316L76.4 64.095l50.114 50.114c3.121 3.121 3.126 8.192.002 11.316-3.118 3.118-8.19 3.123-11.316-.002L65.086 75.409z"
                            >
                            </path>
                        </svg>
                    </button>
                </span>
            </div>
            <div v-if="!showPostEditor">
                <button
                    v-if="isVisibleInGraph && post.title.length === 0"
                    class="focusButton mr-2 float-left"
                    type="button"
                    title="focus on this post in the viewer above"
                    @click="emit('focusPost', post.id)"
                    @mouseover="emit('highlightPost', post.id)"
                    @mouseout="emit('unhighlightPost', post.id)"
                >
                    <span class="text-base">&#128269;</span>
                </button>
                <p
                    class="font-sans markdownContent"
                    v-html="renderedBody"
                ></p>
            </div>
            <PostEditor
                v-else
                :post="post"
            />
        </div>
        <div class="flex justify-between">
            <span>
                <button
                    v-if="dataStore.selectedPostIds.length > 1"
                    class="bottomLink bottomLink--unselected"
                    type="button"
                    title="move this post left"
                    @click="dataStore.movePostLeft(post.id)"
                >
                    <span class="text-2xl">⇐</span>
                </button>
                <button
                    v-if="isPartOfASubgraph"
                    class="bottomLink"
                    :class="bottomTab === 'linked-subgraphs' ? 'bottomLink--selected' : 'bottomLink--unselected'"
                    title="graphs that include this post"
                    type="button"
                    @click="toggleBottomTab('linked-subgraphs')"
                >
                    <span class="text-xs">{{ linkedSubgraphIds.length }} subgraphs</span>
                </button>
                <button
                    v-if="hasLinkedPosts"
                    class="bottomLink"
                    :class="bottomTab === 'linked-posts' ? 'bottomLink--selected' : 'bottomLink--unselected'"
                    type="button"
                    title="posts that link to or from this one"
                    @click="toggleBottomTab('linked-posts')"
                >
                    <span class="text-xs">{{ linksToPostCount }}-{{ linksFromPostCount }} linked posts</span>
                </button>
            </span>
            <span>
                <button
                    class="bottomLink"
                    :class="bottomTab === 'add-linked-post' ? 'bottomLink--selected' : 'bottomLink--unselected'"
                    title="add a post linked to/from this one"
                    type="button"
                    @click="toggleBottomTab('add-linked-post')"
                >
                    <span class="text-3xl">+</span>
                </button>
                <button
                    v-if="dataStore.selectedPostIds.length > 1"
                    class="bottomLink bottomLink--unselected"
                    type="button"
                    title="move this post right"
                    @click="dataStore.movePostRight(post.id)"
                >
                    <span class="text-2xl">⇒</span>
                </button>
            </span>
        </div>
        <component
            :is="bottomTabComponent"
            v-if="bottomTabComponent != null"
            :post="post"
            class="pt-5"
        />
    </section>
</template>

<script setup lang="ts">
///// imports /////
import {computed, ref} from "vue";
import type {PostId, SubgraphId} from "@/src/@types/StoreTypes";
import marked from "@/src/helpers/markedCustomised";

import type {Post} from "@/src/store/models/Post";
import type {LinkedPostIds} from "@/src/store/modules/dataModule";
import PostEditor from "@/src/components/Posts/PostEditor.vue";
import LinkedPosts from "./LinkedPosts.vue";
import LinkedSubgraphs from "./LinkedSubgraphs.vue";
import AddLinkedPost from "./AddLinkedPost.vue";
import {useDataStore, useSettingsStore} from "@/src/store";

defineOptions({
    name: "PostBarPost",
});

type BottomTab = "" | "linked-posts" | "linked-subgraphs" | "add-linked-post";

const props = defineProps<{
    post: Post;
}>();

const emit = defineEmits<{
    focusPost: [postId: PostId];
    highlightPost: [postId: PostId];
    unhighlightPost: [postId: PostId];
}>();

///// refs and variables /////
const dataStore = useDataStore();
const settingsStore = useSettingsStore();
const showPostEditor = ref(false);
const bottomTab = ref<BottomTab>("");
const emptyLinkedPostIds: LinkedPostIds = {
    from: {},
    to: {},
};
const emptySubgraphIds: SubgraphId[] = [];

///// computed /////
const linkedPosts = computed(() => dataStore.linksByPostId[props.post.id] ?? emptyLinkedPostIds);
const linkedSubgraphIds = computed(() => dataStore.subgraphIndexes.subgraphIdsByPostId[props.post.id] ?? emptySubgraphIds);
const linksToPostCount = computed(() => Object.keys(linkedPosts.value.to).length);
const linksFromPostCount = computed(() => Object.keys(linkedPosts.value.from).length);
const hasLinkedPosts = computed(() => linksToPostCount.value > 0 || linksFromPostCount.value > 0);
const isPartOfASubgraph = computed(() => linkedSubgraphIds.value.length > 0);
const isVisibleInGraph = computed(() => dataStore.postIdsInSelectedSubgraphsSet.has(props.post.id));
const renderedBody = computed(() => marked(props.post.body));
const minPostWidth = computed(() => {
    // this means if only 2 posts are open, each will be at least 46% wide
    //                    3 posts are open, each will be at least 30% wide, ...
    // without this, one post could be 70%, the other 30%, which looks really bad
    const numberOfPostsCurrentlySelected = dataStore.selectedPostIds.length;
    return Math.max(settingsStore.postWidth, Math.floor(92 / numberOfPostsCurrentlySelected));
});
const bottomTabComponent = computed(() => {
    switch (bottomTab.value) {
        case "linked-posts":
            return LinkedPosts;
        case "linked-subgraphs":
            return LinkedSubgraphs;
        case "add-linked-post":
            return AddLinkedPost;
        default:
            return null;
    }
});

///// functions /////
function toggleBottomTab(tab: BottomTab): void {
    bottomTab.value = bottomTab.value === tab
        ? ""
        : tab;
}
</script>

<style scoped>
    .post {
        background: white;

        overflow-y: auto;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    @media (max-width: 768px) {
        .post {
            min-width: 92% !important;
        }
    }

    .focusButton {
        cursor: crosshair;
    }

    .transition-150 {
        transition: all 150ms ease-in-out;
    }

    .bottomLink--unselected {
        color: #a0aec0;
    }
    .bottomLink--selected {
        color: #2d3748;
    }
    .bottomLink:hover {
         color: #2d3748;
    }
    .bottomLink:not(:last-of-type):after {
        margin: 0 0.25rem;
        content: "⋅";
    }
</style>
