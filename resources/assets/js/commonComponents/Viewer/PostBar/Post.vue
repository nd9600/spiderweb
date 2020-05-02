<template>
    <section
        class="relative post"
        :style="{
            'min-width': postWidth + 'vw'
        }"
    >
        <div>
            <button
                class="absolute right-0 mr-2 btn btn--primary opacity-25 hover:opacity-100"
                @click="unselectPostId(post.id)"
            >
                x
            </button>
            <h3
                v-if="post.title.length > 0"
                class="h h--3 whitespace-pre-wrap"
            >{{ post.title }}</h3>
            <p class="whitespace-pre-wrap font-sans">{{ post.body }}</p>
        </div>
        <div>
            <div>
                <button
                    v-if="selectedPostIds.length > 1"
                    class="post__dragHandle bottomLink bottomLink--unselected"
                    type="button"
                >
                    <span class="text-xl">⇄</span>
                </button>
                <button
                    v-if="isVisibleInGraph"
                    class="focusButton bottomLink bottomLink--unselected"
                    type="button"
                    title="focus on this post in the viewer above"
                    @click="$root.$emit('focusOnPost', post.id)"
                >
                    <span class="text-base">&#128269;</span>
                </button>
                <button
                    v-if="hasLinkedPosts"
                    class="bottomLink"
                    :class="bottomTab === 'linked-posts' ? 'bottomLink--selected' : 'bottomLink--unselected'"
                    type="button"
                    title="posts that link to or from this one"
                    @click="toggleBottomTab('linked-posts')"
                >
                    linked posts
                </button>
                <button
                    v-if="isAttachedToAGraph"
                    class="bottomLink"
                    :class="bottomTab === 'linked-graphs' ? 'bottomLink--selected' : 'bottomLink--unselected'"
                    title="graphs that include this post"
                    type="button"
                    @click="toggleBottomTab('linked-graphs')"
                >
                    linked graphs
                </button>
                <button
                    class="bottomLink"
                    :class="bottomTab === 'actions' ? 'bottomLink--selected' : 'bottomLink--unselected'"
                    title="things you can do with this post"
                    type="button"
                    @click="toggleBottomTab('actions')"
                >
                    actions
                </button>
            </div>
            <component
                :is="bottomTab"
                v-if="bottomTab !== ''"
                :post="post"
                @close="bottomTab = ''"
            />
        </div>
    </section>
</template>

<script>
import {mapState, mapMutations, mapGetters} from "vuex";

import LinkedPosts from "./LinkedPosts";
import LinkedGraphs from "./LinkedGraphs";
import Actions from "./Actions/Actions";

export default {
    name: "Post",
    components: {
        LinkedPosts,
        LinkedGraphs,
        Actions,
    },
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            bottomTab: ""
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
        ...mapMutations("postsModule", ["unselectPostId"]),

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

    .post__dragHandle {
        cursor: grab;
    }

    .focusButton {
        cursor: crosshair;
    }

    .bottomLink {
        font-size: .75rem;
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