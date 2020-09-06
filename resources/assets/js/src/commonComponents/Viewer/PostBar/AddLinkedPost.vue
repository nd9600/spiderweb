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
            class="mb-2 flex items-start text-xs"
        >
            <span>I want to attach the post to these subgraphs:</span>
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
<script>
import PostMaker from "@/src/commonComponents/Posts/PostMaker";
import {mapState, mapGetters, mapMutations} from "vuex";

export default {
    name: "AddLinkedPost",
    components: {
        PostMaker
    },
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            fromOrToNewPost: "to",
            linkType: "reply",
            subgraphIdsToAttachPostTo: []
        };
    },
    computed: {
        ...mapState("dataModule", ["graphs", "selectedGraphId", "selectedSubgraphIds", "zoom"]),
        ...mapGetters("dataModule", ["titleOrBody", "subgraphsInSelectedGraph"]),

        nodePositions() {
            return this.$store.state.dataModule.graphs[this.selectedGraphId].nodePositions;
        }
    },
    created() {
        this.subgraphIdsToAttachPostTo = this.selectedSubgraphIds;
    },
    methods: {
        ...mapMutations("dataModule", ["addLink", "setPostPosition", "addPostToSubgraph"]),

        toggleFromOrToTheNewPost() {
            const newValue = this.fromOrToNewPost === "from"
                ? "to"
                : "from";
            this.fromOrToNewPost = newValue;
        },

        addedPost(newPost) {
            const source = this.fromOrToNewPost === "from"
                ? newPost.id
                : this.post.id;
            const target = this.fromOrToNewPost === "to"
                ? newPost.id
                : this.post.id;
            this.addLink({
                source: source,
                target: target,
                graph: this.selectedGraphId,
                type: this.linkType,
                subgraphIds: this.subgraphIdsToAttachPostTo
            });

            // we need to set the new post's position too, so it doesn't get added in the middle of the graph
            let positionOfNewPost = {};
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
            this.setPostPosition({
                postId: newPost.id,
                position: positionOfNewPost
            });

            if (this.subgraphIdsToAttachPostTo.length > 0) {
                for (const subgraphId of this.subgraphIdsToAttachPostTo) {
                    this.addPostToSubgraph({
                        subgraphId,
                        postId: newPost.id
                    });
                }
            }
        }
    }
};
</script>
