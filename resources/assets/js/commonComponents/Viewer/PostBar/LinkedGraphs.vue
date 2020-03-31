<template>
    <section>
        <div
            v-if="linkedGraphs.length > 0"
        >
            <h4 class="h h--4">
                Graphs that include this post
            </h4>
            <a
                v-for="graphId in linkedGraphs"
                :key="graphId"
                class="link block mb-2 text-xs md:text-base"
                title="show/hide this graph"
                @click="toggleGraphId(graphId)"
            >
                {{ graphs[graphId].name }}

                <button
                    class="ml-8 py-1 px-2 text-xs btn btn--secondary"
                    @click="removePostFromGraph({graphId, postId: post.id})"
                >
                    remove from graph
                </button>
            </a>
        </div>
    </section>
</template>

<script>
import {mapState, mapGetters, mapMutations} from "vuex";

export default {
    name: "LinkedGraphs",
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapState("postsModule", ["graphs"]),
        ...mapGetters("postsModule", ["graphIdsThatIncludeThisPost"]),

        linkedGraphs() {
            return this.graphIdsThatIncludeThisPost(this.post.id);
        }
    },
    methods: {
        ...mapMutations("postsModule", ["toggleGraphId", "removePostFromGraph"]),

    }
};
</script>