<template>
    <div
        class="postToAttach p-2"
    >
        <div
            v-if="!initialShouldExpand"
            class="p-1 cursor-pointer hover:bg-red-300 font-bold"
            @click.stop="shouldExpand = !shouldExpand"
        >
            <p
                v-if="post.title.length > 0"
            >
                {{ post.title }}
            </p>
            <p
                v-if="post.body.length > 0"
                class="pl-4"
            >
                {{ post.body.substr(0, 30) }}{{ post.body.length > 30 ? "..." : "" }}
            </p>
        </div>
        <label
            v-if="shouldExpand"
            class="mt-2 pl-4 flex flex-col items-start text-xs"
        >
            <template v-if="graphsNotAlreadyAttachedTo.length > 0">
                <select
                    v-if="Object.keys(graphs).length > 1"
                    v-model.number="graphIdsToAttachPostTo"
                    class="select select--secondary"
                    multiple
                    :size="Math.min(Object.keys(graphs).length, 3)"
                >
                    <option
                        v-for="graph in graphsNotAlreadyAttachedTo"
                        :key="graph.id"
                        :value="graph.id"
                    >
                        {{ graph.name }}
                    </option>
                </select>
                <span
                    v-else
                    class="block text-xs text-gray-500"
                >
                    you can only attach the post to the graph '{{ Object.values(graphs)[0].name }}'
                </span>

                <button
                    class="btn btn--primary mt-2"
                    :disabled="graphIdsToAttachPostTo.length === 0"
                    @click="attachPost"
                >
                    Attach
                </button>
            </template>
            <span
                v-else
                class="block text-xs text-gray-500"
            >
                this post is already attached to all the graphs
            </span>
        </label>
    </div>
</template>
<script>
import {mapState, mapMutations, mapGetters} from "vuex";

export default {
    name: "PostAttacher",
    props: {
        post: {
            type: Object,
            required: true
        },
        initialShouldExpand: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            shouldExpand: this.initialShouldExpand,
            graphIdsToAttachPostTo: []
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs"]),
        ...mapGetters("postsModule", ["linkedSubgraphs"]),

        graphsNotAlreadyAttachedTo() {
            const vm = this;
            const graphsAlreadyAttachedTo = this.linkedSubgraphs(this.post.id)
                .map(id => parseInt(id, 10));
            return Object.keys(this.graphs)
                .filter(id => {
                    return !graphsAlreadyAttachedTo.includes(Number(id));
                })
                .map(id => vm.graphs[id]);
        }
    },
    created() {
        if (Object.keys(this.graphs).length === 1) {
            this.graphIdsToAttachPostTo = Object.keys(this.graphs)[0];
        }
    },
    methods: {
        ...mapMutations("postsModule", ["addPostToGraph"]),

        attachPost() {
            if (this.graphIdsToAttachPostTo.length > 0) {
                for (const graphId of this.graphIdsToAttachPostTo) {
                    this.addPostToGraph({
                        graphId,
                        postId: this.post.id
                    });
                }
                this.$emit("attachedPost", this.graphIdsToAttachPostTo);
            }
        }
    }
};
</script>

<style scoped>
    .postToAttach:not(:last-of-type) {
        border-bottom: 1px solid #f56565;
    }
</style>