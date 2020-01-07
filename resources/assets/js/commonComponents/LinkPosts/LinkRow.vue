<template>
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
                <select
                    v-model="type"
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
        <td>
            <button
                class="py-1 px-2 btn btn--secondary"
                @click="removeLinkLocal"
            >
                x
            </button>
        </td>
    </tr>
</template>

<script>
import {mapState, mapGetters, mapMutations } from "vuex";

export default {
    name: "LinkRow",
    props: {
        link: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            graph: this.link.graph,
            source: this.link.source,
            target: this.link.target,
            type: this.link.type,
        };
    },
    computed: {
        ...mapState("postsModule", ["posts", "selectedGraphNames"]),
        ...mapGetters("postsModule", ["postIds", "graphNames"]),

        possibleTargets() {
            return this.postIds.filter(id => id !== this.source);
        }
    },
    watch: {
        "graph": "updateLinkLocal",
        "source": "updateLinkLocal",
        "target": "updateLinkLocal",
        "type": "updateLinkLocal",
    },
    methods: {
        ...mapMutations("postsModule", ["updateLink", "removeLink"]),

        titleOrBody(postId) {
            const post = this.posts[postId];
            return post.title.length > 0
                ? post.title
                : post.body.substr(0, 20);
        },

        updateLinkLocal() {
            this.updateLink({
                id: this.link.id,
                graph: this.graph,
                source: this.source,
                target: this.target,
                type: this.type,
            });
        },
        removeLinkLocal() {
            this.removeLink({
                id: this.link.id,
            });
        }
    }
};
</script>