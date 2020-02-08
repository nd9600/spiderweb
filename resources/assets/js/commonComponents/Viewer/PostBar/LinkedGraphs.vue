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
                class="link block"
                @click="selectGraphId(graphId)"
            >
                {{ graphs[graphId].name }}
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
        ...mapMutations("postsModule", ["selectGraphId"]),
    }
};
</script>