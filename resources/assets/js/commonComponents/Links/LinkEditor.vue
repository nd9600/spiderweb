<template>
    <div>
        <label>
            The link is a
            <select
                v-model="type"
                class="select select--secondary mb-2"
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
            in the graph
            <select
                v-model.number="graphId"
                class="select select--secondary mb-2"
            >
                <option
                    v-for="(graph, id) in graphs"
                    :key="id"
                    :value="id"
                >
                    {{ graph.name }}
                </option>
            </select>

            from
            <select
                v-model.number="source"
                class="select select--secondary mb-2 text-red"
            >
                <option
                    v-for="postId in postIds"
                    :key="postId"
                    :value="postId"
                >
                    {{ titleOrBody(postId) }}
                </option>
            </select>
            →
            <select
                v-model.number="target"
                class="select select--secondary mb-2 text-red"
            >
                <option
                    v-for="postId in possibleTargets"
                    :key="postId"
                    :value="postId"
                >
                    {{ titleOrBody(postId) }}
                </option>
            </select>

            <button
                class="btn btn--secondary py-1 px-2 block"
                @click="removeLinkLocal"
            > &#x1f5d1; remove link
            </button>
        </label>
    </div>
</template>

<script>
import {mapState, mapGetters, mapMutations} from "vuex";
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
                updated_at: moment().format()
            });
            this.$emit("updatedLink", this.link.id);
        },
        removeLinkLocal() {
            this.removeLink({
                id: this.link.id,
            });
            this.$emit("removedLink", this.link.id);
        }
    }
};
</script>