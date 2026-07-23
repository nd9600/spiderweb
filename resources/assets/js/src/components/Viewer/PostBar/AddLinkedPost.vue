<template>
    <section>
        <label class="mb-3 block">
            {{ dataStore.titleOrBody(post.id) }}
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
<script setup lang="ts">
///// imports /////
import {computed, ref} from "vue";
import type {LinkType, NodePosition, SubgraphId} from "@/src/@types/StoreTypes";
import type {Post} from "@/src/store/models/Post";
import PostMaker from "@/src/components/Posts/PostMaker.vue";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "AddLinkedPost",
});

const props = defineProps<{
    post: Post;
}>();

///// refs and variables /////
const dataStore = useDataStore();
const fromOrToNewPost = ref<"from" | "to">("to");
const linkType = ref<LinkType>("reply");
const subgraphIdsToAttachPostTo = ref<SubgraphId[]>([...dataStore.selectedSubgraphIds]);

///// computed /////
const subgraphsInSelectedGraph = computed(() => {
    if (dataStore.selectedGraphId == null) {
        return [];
    }

    return dataStore.subgraphIndexes.subgraphsByGraphId[dataStore.selectedGraphId] ?? [];
});

const nodePositions = computed(() => {
    const selectedGraphId = dataStore.selectedGraphId;
    return selectedGraphId == null
        ? {}
        : dataStore.graphs[selectedGraphId].nodePositions;
});

///// functions /////
function toggleFromOrToTheNewPost(): void {
    fromOrToNewPost.value = fromOrToNewPost.value === "from"
        ? "to"
        : "from";
}

function addedPost(newPost: Post): void {
    const source = fromOrToNewPost.value === "from"
        ? newPost.id
        : props.post.id;
    const target = fromOrToNewPost.value === "to"
        ? newPost.id
        : props.post.id;
    if (dataStore.selectedGraphId == null) {
        return;
    }

    dataStore.addLink({
        source: source,
        target: target,
        graph: dataStore.selectedGraphId,
        type: linkType.value,
        subgraphIds: subgraphIdsToAttachPostTo.value
    });

    // we need to set the new post's position too, so it doesn't get added in the middle of the graph
    let positionOfNewPost: NodePosition;
    const originalPostPosition = nodePositions.value[props.post.id];
    if (originalPostPosition != null) {
        positionOfNewPost = {
            x: originalPostPosition.x + 100,
            y: originalPostPosition.y + 150,
        };
    } else {
        positionOfNewPost = {
            x: (Math.abs(dataStore.zoom.x) * (1 / dataStore.zoom.scale)) + 100,
            y: (Math.abs(dataStore.zoom.y) * (1 / dataStore.zoom.scale)) + 150
        };
    }
    dataStore.setPostPosition({
        postId: newPost.id,
        position: positionOfNewPost
    });

    if (subgraphIdsToAttachPostTo.value.length > 0) {
        for (const subgraphId of subgraphIdsToAttachPostTo.value) {
            dataStore.addPostToSubgraph({
                subgraphId,
                postId: newPost.id
            });
        }
    }
}
</script>
