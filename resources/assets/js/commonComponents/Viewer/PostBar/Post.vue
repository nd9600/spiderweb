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
                    class="post__dragHandle bottomLink bottomLink--unselected"
                    type="button"
                    title="click and drag this to move the post"
                    :class="selectedPostIds.length === 1 ? 'line-through' : ''"
                    :disabled="selectedPostIds.length === 1"
                >
                    move
                </button>
                <button
                    class="focusButton bottomLink bottomLink--unselected"
                    :class="!isVisibleInGraph ? 'line-through' : ''"
                    type="button"
                    title="focus on this post in the viewer above"
                    :disabled="!isVisibleInGraph"
                    @click="$root.$emit('focusOnPost', post.id)"
                >
                    focus
                </button>
                <button
                    class="bottomLink"
                    :class="[bottomTab === 'linked-posts' ? 'bottomLink--selected' : 'bottomLink--unselected', !hasLinkedPosts ? 'line-through' : '']"
                    type="button"
                    title="posts that link to or from this one"
                    :disabled="!hasLinkedPosts"
                    @click="toggleBottomTab('linked-posts')"
                >
                    linked posts
                </button>
                <button
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

        ...mapGetters("postsModule", ["postIdsInSelectedGraphs", "postIdsThatLinkToPost"]),

        hasLinkedPosts() {
            const linkedPosts = this.postIdsThatLinkToPost(this.post.id);
            return Object.keys(linkedPosts.to).length > 0
                || Object.keys(linkedPosts.from).length > 0;
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