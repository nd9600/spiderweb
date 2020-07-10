<template>
    <section>
        <label class="mb-3 block">
            Link in graph:
            <select
                v-model.number="graphId"
                class="select select--secondary max-w-full"
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

        <h4 class="mt-5 h h--4">
            Add post
        </h4>

        <hr class="mb-1">
        <PostMaker
            :shouldShowPostAttacher="false"
            @madePost="addLinkToPost"
        />
    </section>
</template>
<script>
import PostMaker from "@/js/commonComponents/Posts/PostMaker";
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
            graphId: 1,
            fromOrToNewPost: "to",
            linkType: "reply"
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs", "selectedSubgraphIds"]),
        ...mapGetters("postsModule", ["titleOrBody"]),
    },
    created() {
        const initialGraphId = this.selectedSubgraphIds.length > 0
            ? this.selectedSubgraphIds[0]
            : 1;
        this.graphId = initialGraphId;
    },
    methods: {
        ...mapMutations("postsModule", ["addLink"]),

        toggleFromOrToTheNewPost() {
            const newValue = this.fromOrToNewPost === "from"
                ? "to"
                : "from";
            this.fromOrToNewPost = newValue;
        },

        addLinkToPost(newPost) {
            const source = this.fromOrToNewPost === "from"
                ? newPost.id
                : this.post.id;
            const target = this.fromOrToNewPost === "to"
                ? newPost.id
                : this.post.id;
            this.addLink({
                source: source,
                target: target,
                graph: this.graphId,
                type: this.linkType
            });
        }
    }
};
</script>
