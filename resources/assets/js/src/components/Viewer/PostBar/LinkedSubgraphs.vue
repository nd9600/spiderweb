<template>
    <section>
        <div>
            <h4 class="h h--4">
                Subgraphs that include this post
            </h4>
            <a
                v-for="subgraphId in dataStore.linkedSubgraphs(post.id)"
                :key="subgraphId"
                class="link block mb-2 text-xs md:text-base"
                title="show/hide this graph"
                @click="dataStore.toggleSubgraphId(subgraphId)"
            >
                {{ dataStore.subgraphs[subgraphId].name }}

                <button
                    class="ml-8 py-1 px-2 text-xs btn btn--secondary"
                    @click.stop="dataStore.removePostFromSubgraph({subgraphId, postId: post.id})"
                >
                    remove from subgraph
                </button>
            </a>
        </div>
    </section>
</template>

<script setup lang="ts">
///// imports /////
import type {Post} from "@/src/store/models/Post";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "LinkedSubgraphs",
});

defineProps<{
    post: Post;
}>();

///// refs and variables /////
const dataStore = useDataStore();
</script>
