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
                                v-model="source"
                                class="p-2 rounded text-gray-700"
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
                    </td>

                    <td>
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
                    </td>
                </tr>
            </tbody>
        </table>

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
    name: "Linker",
    data() {
        return {
            graph: "default",
            source: null,
            target: null,
            linkType: "reply",

            showTypeSelect: false
        };
    },
    computed: {
        ...mapState("postsModule", ["posts", "selectedGraphNames"]),
        ...mapGetters("postsModule", ["postIds", "graphNames", "titleOrBody"]),

        possibleTargets() {
            return this.postIds.filter(id => id !== this.source);
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
                source: this.source,
                target: this.target,
                graph: this.graph,
                type: this.linkType
            });
        }
    }
};
</script>