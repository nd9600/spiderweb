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
        <template v-if="shouldExpand">
            <label
                v-if="selectedGraphId !== null"
                class="mb-2 text-xs"
            >
                <span>I </span>
                <select
                    v-model="shouldAttachPostToGraph"
                    class="select select--secondary pl-0 py-0 pr-3 text-red"
                >
                    <option :value="true">
                        want
                    </option>
                    <option :value="false">
                        don't want
                    </option>
                </select>
                <span>to attach the post to the currently-open graph</span>
            </label>
            <label class="mt-2 pl-4 flex flex-col items-start text-xs">
                <template v-if="subgraphsNotAlreadyAttachedTo.length > 0">
                    <select
                        v-if="subgraphsInSelectedGraph.length > 1"
                        v-model="subgraphIdsToAttachPostTo"
                        class="select select--secondary"
                        multiple
                        :size="Math.min(subgraphsInSelectedGraph.length, 3)"
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
                        you can only attach the post to the subgraph '{{ subgraphsInSelectedGraph[0].name }}'
                    </span>
                </template>
                <span
                    v-else-if="subgraphsInSelectedGraph.length > 0"
                    class="block text-xs text-gray-500"
                >
                    this post is already attached to all the subgraphs
                </span>
            </label>
            <button
                class="btn btn--primary mt-2"
                :disabled="!shouldAttachPostToGraph && subgraphIdsToAttachPostTo.length === 0"
                @click="attachPost"
            >
                Attach
            </button>
        </template>
    </div>
</template>
<script lang="ts">
import {defineComponent, PropType} from "vue";
import type {PostSerialised} from "@/src/store/classes/Post";
import {useDataStore} from "@/src/store";
import {getLinkedSubgraphs, getSubgraphsInSelectedGraph} from "@/src/store/selectors";

export default defineComponent({
    name: "PostAttacher",
    emits: ["attachedPost"],
    props: {
        post: {
            type: Object as PropType<PostSerialised>,
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
            shouldAttachPostToGraph: true,
            subgraphIdsToAttachPostTo: [] as string[]
        };
    },
    computed: {
        selectedGraphId() {
            return useDataStore().selectedGraphId;
        },
        subgraphsInSelectedGraph() {
            const dataStore = useDataStore();
            return getSubgraphsInSelectedGraph(dataStore.graphs, dataStore.subgraphs, dataStore.selectedGraphId);
        },
        linkedSubgraphs() {
            return (postId: string) => getLinkedSubgraphs(useDataStore().subgraphs, postId);
        },

        subgraphsNotAlreadyAttachedTo() {
            const subgraphsAlreadyAttachedTo = this.linkedSubgraphs(this.post.id)
                .map((id: string) => parseInt(id, 10));
            return this.subgraphsInSelectedGraph
                .filter((subgraph) => !subgraphsAlreadyAttachedTo.includes(Number(subgraph.id)));
        }
    },
    created() {
        if (this.subgraphsInSelectedGraph.length === 1) {
            this.subgraphIdsToAttachPostTo = [this.subgraphsInSelectedGraph[0].id];
        }
    },
    methods: {
        attachPost() {
            const dataStore = useDataStore();
            if (this.shouldAttachPostToGraph && this.selectedGraphId != null) {
                dataStore.addPostToGraph({
                    graphId: this.selectedGraphId,
                    postId: this.post.id
                });
            }

            if (this.subgraphIdsToAttachPostTo.length > 0) {
                for (const subgraphId of this.subgraphIdsToAttachPostTo) {
                    dataStore.addPostToSubgraph({
                        subgraphId,
                        postId: this.post.id
                    });
                }
                this.$emit("attachedPost", this.subgraphIdsToAttachPostTo);
            }
        }
    }
});
</script>

<style scoped>
    .postToAttach:not(:last-of-type) {
        border-bottom: 1px solid #f56565;
    }
</style>
