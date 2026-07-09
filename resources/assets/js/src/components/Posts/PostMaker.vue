<template>
    <div class="flex flex-col">
        <label
            class="mb-5 flex flex-col"
        >
            <button
                class="text-left font-bold underline"
                @click.prevent="toggleTitleInput"
            >
                Title
            </button>
            <input
                v-if="showTitleInput"
                ref="inputTitle"
                v-model="title"
                class="p-2 rounded border text-gray-800 placeholder-gray-600"
                type="text"
                placeholder="On the Origin of Species"
                minlength="0"
                maxlength="1000"
            >
        </label>

        <label class="mb-5 flex flex-col">
            <span class="font-bold">Body</span>
            <textarea
                v-model="body"
                class="p-2 h-48 rounded border text-gray-800 placeholder-gray-600 textareaBody"
                placeholder="[Markdown] But with regard to the material world, we can at least go so far as this—we can perceive that events are brought about not by insulated interpositions of Divine power, exerted in each particular case, but by the establishment of general laws"
                required
                minlength="1"
                maxlength="10000"
            ></textarea>
        </label>

        <label
            v-if="shouldShowPostAttacher && selectedGraphId !== null"
            class="mb-2 text-xs"
        >
            <span>I </span>
            <select
                v-model="shouldAttachPostToGraph"
                class="select select--secondary pl-0 py-0 pr-3 text-red"
            >
                <option :value="true">
                    want
                </option>
                <option :value="false">
                    don't want
                </option>
            </select>
            <span>to attach the post to the currently-open graph</span>
        </label>

        <label
            v-if="shouldShowPostAttacher && subgraphsInSelectedGraph.length > 0"
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

        <button
            type="submit"
            class="mb-5 btn btn--primary"
            :disabled="title.trim().length === 0 && body.trim().length === 0"
            @click="makePost"
        >
            Create
        </button>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {Post} from "@/src/store/models/Post";
import {useDataStore} from "@/src/store";

export default defineComponent({
    name: "PostMaker",
    emits: ["madePost"],
    props: {
        shouldShowPostAttacher: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            showTitleInput: false,

            title: "",
            body: "",
            shouldAttachPostToGraph: true,
            subgraphIdsToAttachPostTo: [] as string[]
        };
    },
    computed: {
        selectedGraphId() {
            return useDataStore().selectedGraphId;
        },
        selectedSubgraphIds() {
            return useDataStore().selectedSubgraphIds;
        },
        subgraphsInSelectedGraph() {
            return useDataStore().subgraphsInSelectedGraph;
        },
    },
    created() {
        this.subgraphIdsToAttachPostTo = this.selectedSubgraphIds;
    },
    methods: {
        toggleTitleInput() {
            const dontLetUserHideTitleInput = this.showTitleInput
                && this.title.trim().length > 0;
            if (dontLetUserHideTitleInput) {
                (this.$refs.inputTitle as HTMLInputElement).focus();
                return;
            }
            this.showTitleInput = !this.showTitleInput;
        },

        async makePost() {
            const newPost = {
                title: this.title,
                body: this.body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const dataStore = useDataStore();
            const newPostWithId = await dataStore.makeNewPost(newPost) as Post;

            if (this.shouldAttachPostToGraph && this.selectedGraphId != null) {
                dataStore.addPostToGraph({
                    graphId: this.selectedGraphId,
                    postId: newPostWithId.id
                });
            }

            if (this.subgraphIdsToAttachPostTo.length > 0) {
                for (const subgraphId of this.subgraphIdsToAttachPostTo) {
                    dataStore.addPostToSubgraph({
                        subgraphId,
                        postId: newPostWithId.id
                    });
                }
            }

            this.resetNewPost();
            this.$emit("madePost", newPostWithId);
        },
        resetNewPost() {
            this.title = "";
            this.body = "";
            this.subgraphIdsToAttachPostTo = [];
        }
    }
});
</script>

<style scoped>
    .textareaBody {
        min-height: 75px;
        max-height: 50%;
    }
</style>
