<template>
    <div>
        <label>
            The link is a
            <select
                v-model="type"
                class="select select--secondary mb-2"
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
        <label v-if="subgraphs.length > 0">
            in the subgraphs ({{ subgraphsLinkIsIn.length }})
            <select
                v-model="subgraphsLinkIsIn"
                class="select select--secondary mb-2"
                multiple
                :size="Math.min(subgraphs.length, 3)"
            >
                <option
                    v-for="subgraph in subgraphs"
                    :key="subgraph.id"
                    :value="subgraph.id"
                >
                    {{ subgraph.name }}
                </option>
            </select>
        </label>

        <p class="mt-2 mb-6">
            from
            <span
                v-if="!clickerStore.wantsToChangeSource"
                class="text-red"
            >
                {{ dataStore.titleOrBody(source) }}
            </span>
            <PostSearch
                v-else
                class="ml-2"
                @clickedOnResult="onPostClick('source', $event)"
            />
            <span :class="clickerStore.wantsToChangeSource ? 'block' : ''">
                <sub
                    v-if="clickerStore.wantsToChangeSource"
                    class="my-2 text-xs text-gray-500"
                >
                    search for a post's title/body, or click on a post
                </sub>

                <button
                    class="btn btn--secondary mt-2 ml-4"
                    type="button"
                    @click="clickerStore.wantsToChangeSource = !clickerStore.wantsToChangeSource"
                >
                    {{ clickerStore.wantsToChangeSource ? "Cancel" : "Change" }}
                </button>
            </span>
        </p>

        <hr>

        <p class="mt-6 mb-10">
            to
            <span
                v-if="!clickerStore.wantsToChangeTarget"
                class="text-red"
            >
                {{ dataStore.titleOrBody(target) }}
            </span>
            <PostSearch
                v-else
                class="ml-2"
                @clickedOnResult="onPostClick('target', $event)"
            />

            <span :class="clickerStore.wantsToChangeTarget ? 'block' : ''">
                <sub
                    v-if="clickerStore.wantsToChangeTarget"
                    class="my-2 text-xs text-gray-500"
                >
                    search for a post's title/body, or click on a post
                </sub>

                <button
                    class="btn btn--secondary mt-2 ml-4"
                    type="button"
                    @click="clickerStore.wantsToChangeTarget = !clickerStore.wantsToChangeTarget"
                >
                    {{ clickerStore.wantsToChangeTarget ? "Cancel" : "Change" }}
                </button>
            </span>
        </p>

        <button
            class="btn btn--secondary mb-4 py-1 px-2 block"
            @click="removeLinkLocal"
        >
            &#x1f5d1; remove link
        </button>
    </div>
</template>

<script setup lang="ts">
///// imports /////
import {computed, ref, watch} from "vue";
import type {LinkId, LinkType, PostId, SubgraphId} from "@/src/@types/StoreTypes";
import type {Link} from "@/src/store/models/Link";
import PostSearch from "@/src/components/Posts/PostSearch.vue";
import {useClickerStore, useDataStore} from "@/src/store";

defineOptions({
    name: "LinkEditor",
});

const props = defineProps<{
    link: Link;
}>();

const emit = defineEmits<{
    updatedLink: [linkId: LinkId];
    removedLink: [linkId: LinkId];
}>();

///// refs and variables /////
const dataStore = useDataStore();
const clickerStore = useClickerStore();
const source = ref<PostId>(props.link.source);
const target = ref<PostId>(props.link.target);
const type = ref<LinkType>(props.link.type);

///// computed /////
const subgraphs = computed(() => Object.values(dataStore.subgraphs)
    .filter((subgraph) => subgraph.graph === props.link.graph));

const subgraphsLinkIsIn = computed<SubgraphId[]>({
    get() {
        return subgraphs.value
            .filter((subgraph) => subgraph.links[props.link.id] === true)
            .map((subgraph) => subgraph.id);
    },
    set(subgraphsLinkIsIn) {
        dataStore.setSubgraphsLinkIsIn({linkId: props.link.id, subgraphsLinkIsIn});
    }
});

///// functions /////
function onPostClick(sourceOrTarget: "source" | "target", post: {id: PostId}): void {
    if (sourceOrTarget === "source") {
        source.value = post.id;
        clickerStore.wantsToChangeSource = false;
    } else {
        target.value = post.id;
        clickerStore.wantsToChangeTarget = false;
    }
}

function updateLinkLocal(): void {
    dataStore.updateLink({
        id: props.link.id,
        graph: props.link.graph,
        source: source.value,
        target: target.value,
        type: type.value
    });
    emit("updatedLink", props.link.id);
}

function removeLinkLocal(): void {
    dataStore.removeLink({
        id: props.link.id,
    });
    emit("removedLink", props.link.id);
}

///// watchers /////
watch([source, target, type], () => {
    updateLinkLocal();
});
</script>
