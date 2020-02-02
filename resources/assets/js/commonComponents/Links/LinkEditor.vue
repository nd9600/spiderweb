<template>
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
                        v-for="(graph, id) in graphs"
                        :key="id"
                        :value="id"
                    >
                        {{ graph.name }}
                    </option>
                </select>
            </label>
        </td>

        <td>
            <label>
                <select
                    v-model="type"
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
        <td class="flex justify-center">
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
import moment from "moment";

export default {
    name: "LinkEditor",
    props: {
        link: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            graphId: this.link.graph,
            source: this.link.source,
            target: this.link.target,
            type: this.link.type,
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs", "posts", "selectedGraphNames"]),
        ...mapGetters("postsModule", ["postIds", "graphNames", "titleOrBody"]),

        possibleTargets() {
            return this.postIds.filter(id => id !== this.source);
        }
    },
    watch: {
        "graphId": "updateLinkLocal",
        "source": "updateLinkLocal",
        "target": "updateLinkLocal",
        "type": "updateLinkLocal",
    },
    methods: {
        ...mapMutations("postsModule", ["updateLink", "removeLink"]),

        updateLinkLocal() {
            this.updateLink({
                id: this.link.id,
                graph: this.graphId,
                source: this.source,
                target: this.target,
                type: this.type,
                updated_at:  moment().format()
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