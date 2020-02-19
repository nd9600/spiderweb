<template>
    <div>
        <h3 class="h h--3">
            {{ post.title.length > 0 ? post.title : post.body.substr(0, 20) }}
        </h3>
        <p>
            Link in graph
            <label>
                <select
                    v-model.number="graphId"
                    class="p-2 rounded text-gray-700 bg-white"
                >
                    <option
                        v-for="(graph, id) in graphs"
                        :key="id"
                        :value="id"
                    >
                        {{ graph.name }}
                    </option>
                </select>
            </label>
            <span class="font-bold">from</span> post
            <label>
                <select
                    v-model.number="source"
                    class="p-2 rounded text-gray-700 bg-white"
                >
                    <option
                        v-for="postId in possibleSources"
                        :key="postId"
                        :value="postId"
                    >
                        {{ titleOrBody(postId) }}
                    </option>
                </select>
            </label>
            <span class="font-bold">to</span> {{ post.title.length > 0 ? post.title : post.body.substr(0, 20) }}

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
                        class="p-2 rounded text-gray-700 bg-white"
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
            :disabled="graphId.length === 0 || source === null"
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
    name: "PostLinker",
    props: {
        post: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            graphId: 1,
            source: null,
            linkType: "reply",

            showTypeSelect: false
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs", "posts", "selectedGraphIds"]),
        ...mapGetters("postsModule", ["postIds", "graphNames", "titleOrBody"]),

        possibleSources() {
            return this.postIds.filter(id => id !== this.post.id);
        }
    },
    mounted() {
        const initialGraphId = this.selectedGraphIds.length > 0
            ? this.selectedGraphIds[0]
            : 1;
        this.graphId = initialGraphId;
    },
    methods: {
        ...mapMutations("postsModule", ["addLink"]),

        linkPostLocal() {
            this.addLink({
                source: this.source,
                target: this.post.id,
                graph: this.graphId,
                type: this.linkType
            });
        }
    }
};
</script>