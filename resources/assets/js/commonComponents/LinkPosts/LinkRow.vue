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
        ...mapGetters("postsModule", ["postIds", "graphNames", "titleOrBody"]),

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

        updateLinkLocal() {
            this.updateLink({
                id: this.link.id,
                graph: this.graph,
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