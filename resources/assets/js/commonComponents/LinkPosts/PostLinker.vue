<template>
    <div>
        <h3 class="h h--3">
            {{ post.title.length > 0 ? post.title : post.body.substr(0, 20) }}
        </h3>
        <p>
            Link in graph
            <label>
                <select
                    v-model="graph"
                    class="p-2 rounded text-gray-700"
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
                    v-model="target"
                    class="p-2 rounded text-gray-700"
                >
                    <option
                        v-for="postId in possibleTargets"
                        :key="postId"
                        :value="postId"
                    >
                        {{ titleOrBody(postId) }}
                    </option>
                </select>
            </label>

            <template>
                <label>
                    <br>
                    <button
                        class="text-left underline"
                        @click.prevent="showTypeSelect = !showTypeSelect"
                    >
                        with type
                    </button>
                    <select
                        v-if="showTypeSelect"
                        v-model="linkType"
                        class="p-2 rounded text-gray-700"
                    >
                        <option value="reply">
                            reply
                        </option>
                        <option value="sidenote">
                            sidenote
                        </option>
                        <option value="link">
                            link
                        </option>
                    </select>
                </label>
            </template>
        </p>

        <button
            class="mt-2 btn btn--primary"
            :disabled="graph.length === 0 || target === null"
            @click="linkPostLocal"
        >
            Link
        </button>

        <div class="flex justify-center">
            <hr class="my-4 w-2/3">
        </div>
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
            graph: "default",
            target: null,
            linkType: "reply",

            showTypeSelect: false
        };
    },
    computed: {
        ...mapState("postsModule", ["posts", "selectedGraphNames"]),
        ...mapGetters("postsModule", ["postIds", "graphNames", "titleOrBody"]),

        possibleTargets() {
            return this.postIds.filter(id => id !== this.post.id);
        }
    },
    created() {
        const initialGraphName = this.selectedGraphNames.length === 1
            ? this.selectedGraphNames[0]
            : "default";
        this.graph = initialGraphName;
    },
    methods: {
        ...mapMutations("postsModule", ["addLink"]),

        linkPostLocal() {
            this.addLink({
                source: this.post.id,
                target: this.target,
                graph: this.graph,
                type: this.linkType
            });
        }
    }
};
</script>