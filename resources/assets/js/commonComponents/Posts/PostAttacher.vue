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
            <template v-if="subgraphsNotAlreadyAttachedTo.length > 0">
                <select
                    v-if="Object.keys(subgraphsInSelectedGraph).length > 1"
                    v-model.number="subgraphIdsToAttachPostTo"
                    class="select select--secondary"
                    multiple
                    :size="Math.min(Object.keys(subgraphsInSelectedGraph).length, 3)"
                >
                    <option
                        v-for="subgraph in subgraphsNotAlreadyAttachedTo"
                        :key="subgraph.id"
                        :value="subgraph.id"
                    >
                        {{ subgraph.name }}
                    </option>
                </select>
                <span
                    v-else
                    class="block text-xs text-gray-500"
                >
                    you can only attach the post to the subgraph '{{ Object.values(subgraphsInSelectedGraph)[0].name }}'
                </span>

                <button
                    class="btn btn--primary mt-2"
                    :disabled="subgraphIdsToAttachPostTo.length === 0"
                    @click="attachPost"
                >
                    Attach
                </button>
            </template>
            <span
                v-else
                class="block text-xs text-gray-500"
            >
                this post is already attached to all the subgraphs
            </span>
        </label>
    </div>
</template>
<script>
import {mapMutations, mapGetters} from "vuex";

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
            subgraphIdsToAttachPostTo: []
        };
    },
    computed: {
        ...mapGetters("postsModule", ["subgraphsInSelectedGraph", "linkedSubgraphs"]),

        subgraphsNotAlreadyAttachedTo() {
            const vm = this;
            const subgraphsAlreadyAttachedTo = this.linkedSubgraphs(this.post.id)
                .map(id => parseInt(id, 10));
            return Object.keys(this.subgraphsInSelectedGraph)
                .filter(id => {
                    return !subgraphsAlreadyAttachedTo.includes(Number(id));
                })
                .map(id => vm.subgraphs[id]);
        }
    },
    created() {
        if (Object.keys(this.subgraphsInSelectedGraph).length === 1) {
            this.subgraphIdsToAttachPostTo = Object.keys(this.subgraphsInSelectedGraph)[0];
        }
    },
    methods: {
        ...mapMutations("postsModule", ["addPostToSubgraph"]),

        attachPost() {
            if (this.subgraphIdsToAttachPostTo.length > 0) {
                for (const subgraphId of this.subgraphIdsToAttachPostTo) {
                    this.addPostToSubgraph({
                        subgraphId,
                        postId: this.post.id
                    });
                }
                this.$emit("attachedPost", this.subgraphIdsToAttachPostTo);
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