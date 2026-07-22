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

<script lang="ts">
import {defineComponent, PropType} from "vue";
import type {Post} from "@/src/store/models/Post";
import {useDataStore} from "@/src/store";

export default defineComponent({
    name: "LinkedSubgraphs",
    props: {
        post: {
            type: Object as PropType<Post>,
            required: true
        }
    },
    computed: {
        subgraphs() {
            return useDataStore().subgraphs;
        },
        linkedSubgraphs() {
            return useDataStore().linkedSubgraphs;
        },
    },
    methods: {
        toggleSubgraphId(subgraphId: string) {
            useDataStore().toggleSubgraphId(subgraphId);
        },
        removePostFromSubgraph(payload: {subgraphId: string; postId: string}) {
            useDataStore().removePostFromSubgraph(payload);
        },
    }
});
</script>
