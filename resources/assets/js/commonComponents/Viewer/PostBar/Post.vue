<template>
    <section
        class="relative post"
        :style="{
            'min-width': postWidth + 'vw'
        }"
    >
        <div>
            <div class="flex justify-between">
                <h3
                    v-if="post.title.length > 0"
                    class="h h--3 mr-2 whitespace-pre-wrap"
                ><button
                    v-if="isVisibleInGraph"
                    class="focusButton mr-2"
                    type="button"
                    title="focus on this post in the viewer above"
                    @click="$root.$emit('focusOnPost', post.id)"
                >
                    <span class="text-base">&#128269;</span>
                </button>{{ post.title }}</h3>
                <span style="min-width: 48px;">
                    <button
                        type="button"
                        class="mr-2 opacity-25 hover:opacity-100 transition-150"
                        @click="toggleBottomTab('post-editor')"
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
                        @click="unselectPostId(post.id)"
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
            <div>
                <button
                    v-if="isVisibleInGraph && post.title.length === 0"
                    class="focusButton mr-2"
                    type="button"
                    title="focus on this post in the viewer above"
                    @click="$root.$emit('focusOnPost', post.id)"
                >
                    <span class="text-base">&#128269;</span>
                </button>
                <p
                    class="whitespace-pre-wrap font-sans"
                >{{ post.body }}</p>
            </div>
        </div>
        <div class="flex justify-between">
            <span>
                <button
                    v-if="selectedPostIds.length > 1"
                    class="bottomLink bottomLink--unselected"
                    type="button"
                    title="move this post left"
                    @click="movePostLeft(post.id)"
                >
                    <span class="text-xl">⇐</span>
                </button>
                <button
                    v-if="isAttachedToAGraph"
                    class="bottomLink"
                    :class="bottomTab === 'linked-graphs' ? 'bottomLink--selected' : 'bottomLink--unselected'"
                    title="graphs that include this post"
                    type="button"
                    @click="toggleBottomTab('linked-graphs')"
                >
                    <span class="text-xs">linked graphs</span>
                </button>
                <button
                    v-if="hasLinkedPosts"
                    class="bottomLink"
                    :class="bottomTab === 'linked-posts' ? 'bottomLink--selected' : 'bottomLink--unselected'"
                    type="button"
                    title="posts that link to or from this one"
                    @click="toggleBottomTab('linked-posts')"
                >
                    <span class="text-xs">linked posts</span>
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
                    <span class="text-xl">+</span>
                </button>
                <button
                    v-if="selectedPostIds.length > 1"
                    class="bottomLink bottomLink--unselected"
                    type="button"
                    title="move this post right"
                    @click="movePostRight(post.id)"
                >
                    <span class="text-xl">⇒</span>
                </button>
            </span>
        </div>
        <component
            :is="bottomTab"
            v-if="bottomTab !== ''"
            :post="post"
            class="pt-5"
        />
    </section>
</template>

<script>
import {mapState, mapMutations, mapGetters} from "vuex";

import PostEditor from "@/js/commonComponents/Posts/PostEditor";
import LinkedPosts from "./LinkedPosts";
import LinkedGraphs from "./LinkedGraphs";
import AddLinkedPost from "./AddLinkedPost";

export default {
    name: "Post",
    components: {
        PostEditor,
        LinkedPosts,
        LinkedGraphs,
        AddLinkedPost,
    },
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            bottomTab: "" // linked-posts | linked-graphs | post-editor add-linked-post
        };
    },
    computed: {
        ...mapState("settingsModule", ["postWidth"]),
        ...mapState("postsModule", ["selectedPostIds"]),

        ...mapGetters("postsModule", ["postIdsInSelectedGraphs", "postIdsThatLinkToPost", "graphIdsThatIncludeThisPost"]),
        hasLinkedPosts() {
            const linkedPosts = this.postIdsThatLinkToPost(this.post.id);
            return Object.keys(linkedPosts.to).length > 0
                || Object.keys(linkedPosts.from).length > 0;
        },
        isAttachedToAGraph() {
            return this.graphIdsThatIncludeThisPost(this.post.id).length > 0;
        },
        isVisibleInGraph() {
            return this.postIdsInSelectedGraphs.includes(this.post.id);
        }
    },
    methods: {
        ...mapMutations("postsModule", ["unselectPostId", "movePostLeft", "movePostRight"]),

        toggleBottomTab(tab) {
            this.bottomTab = this.bottomTab === tab
                ? ""
                : tab;
        }
    }
};
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
        content: "⋅"
    }
</style>