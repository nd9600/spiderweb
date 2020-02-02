<template>
    <div>
        <h2 class="h h--2">
            Add new link
        </h2>
        <table class="w-full">
            <thead>
                <tr>
                    <td>Source</td>
                    <td>Target</td>
                    <td>Graph</td>
                    <td></td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <label>
                            <select
                                v-model.number="source"
                                class="p-2 rounded text-gray-700 bg-white"
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
                    </td>

                    <td>
                        <label>
                            <select
                                v-model.number="target"
                                class="p-2 rounded text-gray-700 bg-white"
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
                    </td>

                    <td>
                        <label>
                            <select
                                v-model.number="graphId"
                                class="p-2 rounded text-gray-700 bg-white"
                            >
                                <option
                                    v-for="(graph, graphId) in graphs"
                                    :key="graphId"
                                    :value="graphId"
                                >
                                    {{ graph.name }}
                                </option>
                            </select>
                        </label>
                    </td>

                    <td>
                        <label>
                            <button
                                v-if="!showTypeSelect"
                                class="text-left underline"
                                @click.prevent="showTypeSelect = !showTypeSelect"
                            >
                                with type
                            </button>
                            <select
                                v-else
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
                    </td>
                </tr>
            </tbody>
        </table>

        <button
            class="mt-2 btn btn--primary"
            :disabled="graphId.length === 0 || target === null"
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
    name: "Linker",
    data() {
        return {
            graphId: 1,
            source: null,
            target: null,
            linkType: "reply",

            showTypeSelect: false
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs", "posts", "selectedGraphIds"]),
        ...mapGetters("postsModule", ["postIds", "titleOrBody"]),

        possibleTargets() {
            return this.postIds.filter(id => id !== this.source);
        }
    },
    created() {
        const initialGraphId = this.selectedGraphIds.length === 1
            ? this.selectedGraphIds[0]
            : 1;
        this.graph = initialGraphId;
    },
    methods: {
        ...mapMutations("postsModule", ["addLink"]),

        linkPostLocal() {
            this.addLink({
                source: this.source,
                target: this.target,
                graph: this.graphId,
                type: this.linkType
            });
        }
    }
};
</script>