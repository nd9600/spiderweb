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
            <h1
                v-if="post.title.length > 0"
                class="h h--1 whitespace-pre-wrap"
            >{{ post.title }}</h1>
            <p class="whitespace-pre-wrap">{{ post.body }}</p>
        </div>
        <div>
            <div>
                <button
                    class="bottomLink"
                    :class="bottomTab === 'linked-posts' ? 'bottomLink--selected' : 'bottomLink--unselected'"
                    type="button"
                    title="posts that link to or from this one"
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
import {mapState, mapMutations} from "vuex";

import LinkedPosts from "./LinkedPosts";
import LinkedGraphs from "./LinkedGraphs";
import Actions from "./Actions";

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