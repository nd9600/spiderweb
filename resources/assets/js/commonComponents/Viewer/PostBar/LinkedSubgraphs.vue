<template>
    <section>
        <div>
            <h4 class="h h--4">
                Subgraphs that include this post
            </h4>
            <a
                v-for="subgraphId in linkedSubgraphs(post.id)"
                :key="subgraphId"
                class="link block mb-2 text-xs md:text-base"
                title="show/hide this graph"
                @click="toggleSubgraphId(subgraphId)"
            >
                {{ subgraphs[subgraphId].name }}

                <button
                    class="ml-8 py-1 px-2 text-xs btn btn--secondary"
                    @click.stop="removePostFromSubgraph({subgraphId, postId: post.id})"
                >
                    remove from subgraph
                </button>
            </a>
        </div>
    </section>
</template>

<script>
import {mapState, mapGetters, mapMutations} from "vuex";

export default {
    name: "LinkedSubgraphs",
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapState("postsModule", ["subgraphs"]),
        ...mapGetters("postsModule", ["linkedSubgraphs"]),
    },
    methods: {
        ...mapMutations("postsModule", ["toggleSubgraphId", "removePostFromSubgraph"]),

    }
};
</script>