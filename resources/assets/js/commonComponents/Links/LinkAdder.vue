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
            in the graph
            <select
                v-model.number="newLinkGraphId"
                class="select select--secondary max-w-full"
            >
                <option
                    v-for="(graph, id) in graphs"
                    :key="id"
                    :value="id"
                    class="truncate"
                >
                    {{ graph.name }}
                </option>
            </select>
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
    </div>
</template>

<script>
import {mapState, mapGetters, mapMutations, mapActions} from "vuex";


import PostSearch from "@/js/commonComponents/Posts/PostSearch";

export default {
    name: "LinkAdder",
    components: {
        PostSearch
    },
    computed: {
        ...mapState("dataModule", ["graphs"]),
        ...mapGetters("dataModule", ["titleOrBody"]),

        ...mapState("clickerModule", ["newLinkSource"]),

        newLinkGraphId: {
            get() {
                return this.$store.state.clickerModule.newLinkGraphId;
            },
            set(newLinkGraphId) {
                this.setNewLinkGraphId(newLinkGraphId);
            }
        },
        newLinkType: {
            get() {
                return this.$store.state.clickerModule.newLinkType;
            },
            set(newLinkType) {
                this.setNewLinkType(newLinkType);
            }
        },
    },
    methods: {
        ...mapMutations("clickerModule", [
            "setNewLinkSource",
            "setNewLinkGraphId",
            "setNewLinkType",
        ]),
        ...mapActions("clickerModule", ["handlePostClick"]),
    }
};
</script>