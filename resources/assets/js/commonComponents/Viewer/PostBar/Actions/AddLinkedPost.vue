<template>
    <section>
        <button
            class="h h--3 mb-5 underline"
            type="button"
            @click="show = !show"
        >
            Add linked post
        </button>

        <template v-if="show">
            <label class="block">
                Link in graph:
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

            <label class="block">
                <select
                    v-model="fromOrToNewPost"
                    class="p-2 rounded text-gray-700 bg-white"
                >
                    <option value="from">
                        from
                    </option>
                    <option value="to">
                        to
                    </option>
                </select>
                the new post
            </label>

            <label class="block">
                link type:
                <select
                    v-model="linkType"
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

            <h4 class="mt-5 h h--4">
                Add post
            </h4>

            <hr class="mb-1">
            <post-maker
                @madePost="addLinkToPost"
            />
        </template>
    </section>
</template>
<script>
import PostMaker from "@/js/commonComponents/Posts/PostMaker";
import {mapState, mapMutations} from "vuex";

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
            show: false,

            graphId: 1,
            fromOrToNewPost: "to",
            linkType: "reply"
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs", "selectedGraphIds"]),
    },
    created() {
        const initialGraphId = this.selectedGraphIds.length > 0
            ? this.selectedGraphIds[0]
            : 1;
        this.graphId = initialGraphId;
    },
    methods: {
        ...mapMutations("postsModule", ["addLink"]),

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
