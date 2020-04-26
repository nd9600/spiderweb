<template>
    <div
        class="postToAttach p-2"
    >
        <template
            v-if="!initialShouldExpand"
        >
            <p
                v-if="post.title.length > 0"
                class="p-1 cursor-pointer hover:bg-red-300 font-bold"
                @click.stop="shouldExpand = !shouldExpand"
            >
                {{ post.title }}
            </p>
            <p
                v-if="post.body.length > 0"
                class="pl-4"
            >
                {{ post.body.substr(0, 30) }}{{ post.body.length > 30 ? "..." : "" }}
            </p>
        </template>
        <label
            v-if="shouldExpand"
            class="mt-2 pl-4 flex flex-col items-start text-xs"
        >
            <select
                v-if="Object.keys(graphs).length > 1"
                v-model.number="graphIdsToAttachPostTo"
                class="select select--secondary"
                multiple
                :size="Math.min(Object.keys(graphs).length, 3)"
            >
                <option
                    v-for="(graph, graphId) in graphs"
                    :key="graphId"
                    :value="graphId"
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
        </label>
    </div>
</template>
<script>
import {mapState, mapMutations} from "vuex";

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