<template>
    <section>
        <label class="mb-3 block">
            {{ titleOrBody(post.id) }}
            <button
                class="mx-4 link"
                type="button"
                @click="toggleFromOrToTheNewPost"
            >
                {{ fromOrToNewPost === "to" ? "→" : "←" }}
            </button>
            [the new post]
        </label>

        <label class="mb-3 block">
            link type:
            <select
                v-model="linkType"
                class="select select--secondary max-w-full"
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

        <label
            v-if="subgraphsInSelectedGraph.length > 0"
            class="mb-2 flex flex-col items-start text-xs"
        >
            <span>I want to attach the post to these subgraphs ({{ subgraphIdsToAttachPostTo.length }}):</span>
            <select
                v-model="subgraphIdsToAttachPostTo"
                class="select select--secondary"
                multiple
                :size="Math.min(subgraphsInSelectedGraph.length, 3)"
            >
                <option
                    v-for="subgraph in subgraphsInSelectedGraph"
                    :key="subgraph.id"
                    :value="subgraph.id"
                >
                    {{ subgraph.name }}
                </option>
            </select>
        </label>

        <h4 class="mt-5 h h--4">
            Add post
        </h4>

        <hr class="mb-1">
        <PostMaker
            :shouldShowPostAttacher="false"
            @madePost="addedPost"
        />
    </section>
</template>
<script lang="ts">
import {defineComponent, PropType} from "vue";
import type {LinkType, NodePosition} from "@/src/@types/StoreTypes";
import type Post from "@/src/store/classes/Post";
import type {PostSerialised} from "@/src/store/classes/Post";
import PostMaker from "@/src/components/Posts/PostMaker.vue";
import {useDataStore} from "@/src/store";
import {getSubgraphsInSelectedGraph, getTitleOrBody} from "@/src/store/selectors";

export default defineComponent({
    name: "AddLinkedPost",
    components: {
        PostMaker
    },
    props: {
        post: {
            type: Object as PropType<PostSerialised>,
            required: true
        }
    },
    data() {
        return {
            fromOrToNewPost: "to" as "from" | "to",
            linkType: "reply" as LinkType,
            subgraphIdsToAttachPostTo: [] as string[]
        };
    },
    computed: {
        selectedGraphId() {
            return useDataStore().selectedGraphId;
        },
        selectedSubgraphIds() {
            return useDataStore().selectedSubgraphIds;
        },
        zoom() {
            return useDataStore().zoom;
        },
        titleOrBody() {
            return (postId: string) => getTitleOrBody(useDataStore().posts, postId);
        },
        subgraphsInSelectedGraph() {
            const dataStore = useDataStore();
            return getSubgraphsInSelectedGraph(dataStore.graphs, dataStore.subgraphs, dataStore.selectedGraphId);
        },

        nodePositions() {
            const selectedGraphId = this.selectedGraphId;
            return selectedGraphId == null
                ? {}
                : useDataStore().graphs[selectedGraphId].nodePositions;
        }
    },
    created() {
        this.subgraphIdsToAttachPostTo = this.selectedSubgraphIds;
    },
    methods: {
        toggleFromOrToTheNewPost() {
            const newValue = this.fromOrToNewPost === "from"
                ? "to"
                : "from";
            this.fromOrToNewPost = newValue;
        },

        addedPost(newPost: Post) {
            const dataStore = useDataStore();
            const source = this.fromOrToNewPost === "from"
                ? newPost.id
                : this.post.id;
            const target = this.fromOrToNewPost === "to"
                ? newPost.id
                : this.post.id;
            if (this.selectedGraphId == null) {
                return;
            }

            dataStore.addLink({
                source: source,
                target: target,
                graph: this.selectedGraphId,
                type: this.linkType,
                subgraphIds: this.subgraphIdsToAttachPostTo
            });

            // we need to set the new post's position too, so it doesn't get added in the middle of the graph
            let positionOfNewPost: NodePosition;
            const originalPostPosition = this.nodePositions[this.post.id];
            if (originalPostPosition != null) {
                positionOfNewPost = {
                    x: originalPostPosition.x + 100,
                    y: originalPostPosition.y + 150,
                };
            } else {
                positionOfNewPost = {
                    x: (Math.abs(this.zoom.x) * (1 / this.zoom.scale)) + 100,
                    y: (Math.abs(this.zoom.y) * (1 / this.zoom.scale)) + 150
                };
            }
            dataStore.setPostPosition({
                postId: newPost.id,
                position: positionOfNewPost
            });

            if (this.subgraphIdsToAttachPostTo.length > 0) {
                for (const subgraphId of this.subgraphIdsToAttachPostTo) {
                    dataStore.addPostToSubgraph({
                        subgraphId,
                        postId: newPost.id
                    });
                }
            }
        }
    }
});
</script>
