<template>
    <div>
        <label class="mb-4">
            The new link will be a
            <select
                v-model="newLinkType"
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
            <template v-if="Object.keys(subgraphs).length > 0">
                in the subgraphs ({{ newLinkSubgraphIds.length }})
                <select
                    v-model="newLinkSubgraphIds"
                    class="select select--secondary max-w-full"
                    :size="Math.min(Object.keys(subgraphs).length, 3)"
                    multiple
                >
                    <option
                        v-for="(subgraph, id) in subgraphs"
                        :key="id"
                        :value="id"
                        class="truncate"
                    >
                        {{ subgraph.name }}
                    </option>
                </select>
            </template>
        </label>

        <label
            v-if="newLinkSource"
            class="mt-4 pt-4 block"
            style="border-top: 1px solid var(--red)"
        >
            It'll be from
            <span class="inline-block">
                <span class="text-red">{{ titleOrBody(newLinkSource) }}</span>
                →
            </span>

            <PostSearch
                class="ml-2"
                @clickedOnResult="handlePostClick($event)"
            />

            <div class="my-2 flex justify-between">
                <p class="text-xs text-gray-500">
                    search for a post's title/body, or click on a post
                </p>

                <button
                    class="btn btn--secondary"
                    type="button"
                    :disabled="newLinkSource == null"
                    title="remove this source"
                    @click="setNewLinkSource(null)"
                >
                    x
                </button>
            </div>
        </label>
        <p
            v-else
            class="mt-4 text-xs text-gray-500"
        >
            click on a post to pick the link's source
        </p>
    </div>
</template>

<script>
import {mapActions, mapState} from "pinia";


import PostSearch from "@/src/commonComponents/Posts/PostSearch";
import {useClickerStore, useDataStore} from "@/src/offline/store";

export default {
    name: "LinkAdder",
    components: {
        PostSearch
    },
    computed: {
        ...mapState(useDataStore, ["subgraphs", "selectedSubgraphIds", "titleOrBody"]),

        ...mapState(useClickerStore, ["newLinkSource"]),

        newLinkSubgraphIds: {
            get() {
                return useClickerStore().newLinkSubgraphIds;
            },
            set(newLinkSubgraphIds) {
                this.setNewLinkSubgraphIds(newLinkSubgraphIds);
            }
        },

        newLinkType: {
            get() {
                return useClickerStore().newLinkType;
            },
            set(newLinkType) {
                this.setNewLinkType(newLinkType);
            }
        },
    },
    created() {
        this.newLinkSubgraphIds = this.selectedSubgraphIds;
    },
    methods: {
        ...mapActions(useClickerStore, [
            "setNewLinkSource",
            "setNewLinkType",
            "setNewLinkSubgraphIds"
        ]),
        ...mapActions(useClickerStore, ["handlePostClick"]),
    }
};
</script>
