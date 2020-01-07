<template>
    <div>
        <h3 class="h h--3">
            {{ post.title.length > 0 ? post.title : post.body.substr(0, 20) }}
        </h3>
        <p>
            Link in graph
            <label>
                <select
                    v-model="graphToLinkIn"
                    class="mt-2 p-2 rounded text-gray-700"
                >
                    <option
                        v-for="graphName in graphNames"
                        :key="graphName"
                        :value="graphName"
                    >
                        {{ graphName }}
                    </option>
                </select>
            </label>
            to post
            <label>
                <select
                    v-model="postIdToLinkTo"
                    class="mt-2 p-2 rounded text-gray-700"
                >
                    <option
                        v-for="postId in postIds"
                        :key="postId"
                        :value="postId"
                    >
                        {{ titleOrBody(postId) }}
                    </option>
                </select>
            </label>
        </p>

        <button
            class="btn btn--primary"
            :disabled="graphToLinkIn.length === 0 || postIdToLinkTo === null"
            @click="linkPostLocal"
        >
            Link
        </button>
    </div>
</template>

<script>
import {mapState, mapGetters, mapMutations } from "vuex";

export default {
    name: "LinkPosts",
    props: {
        post: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            graphToLinkIn: "default",
            postIdToLinkTo: null,
        };
    },
    computed: {
        ...mapState("postsModule", ["posts"]),
        ...mapGetters("postsModule", ["postIds", "graphNames"])
    },
    methods: {
        ...mapMutations("postsModule", ["addLink"]),

        titleOrBody(postId) {
            const post = this.posts[postId];
            return post.title.length > 0
                ? post.title
                : post.body.substr(0, 20);
        },

        linkPostLocal() {
            this.addLink({
                source: this.post.id,
                target: this.postIdToLinkTo,
                graph: this.graphToLinkIn
            });
        }
    }
};
</script>