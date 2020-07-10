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
                required="required"
                minlength="1"
                maxlength="10000"
            ></textarea>
        </label>

        <label
            v-if="shouldShowPostAttacher"
            class="mb-2 flex justify-between items-start text-xs"
        >
            <span>I want to attach the post to these subgraphs:</span>
            <select
                v-model.number="subgraphIdsToAttachPostTo"
                class="select select--secondary"
                multiple
                :size="Math.min(Object.keys(subgraphsInSelectedGraph).length, 3)"
            >
                <option
                    v-for="(subgraph, subgraphId) in subgraphsInSelectedGraph"
                    :key="subgraphId"
                    :value="subgraphId"
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

<script>
import {mapGetters, mapMutations, mapActions} from "vuex";

export default {
    name: "PostMaker",
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
            subgraphIdsToAttachPostTo: []
        };
    },
    computed: {
        ...mapGetters("postsModule", ["subgraphsInSelectedGraph"]),
    },
    methods: {
        ...mapMutations("postsModule", ["addPostToSubgraph"]),
        ...mapActions("postsModule", ["makeNewPost"]),

        toggleTitleInput() {
            const dontLetUserHideTitleInput = this.showTitleInput
                && this.title.trim().length > 0;
            if (dontLetUserHideTitleInput) {
                this.$refs.inputTitle.focus();
                return;
            }
            this.showTitleInput = !this.showTitleInput;
        },

        async makePost() {
            let newPost = {
                title: this.title,
                body: this.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            const newPostWithId = await this.makeNewPost(newPost);
            if (this.subgraphIdsToAttachPostTo.length > 0) {
                for (const graphId of this.subgraphIdsToAttachPostTo) {
                    this.addPostToSubgraph({
                        graphId,
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
};
</script>

<style scoped>
    .textareaBody {
        min-height: 75px;
        max-height: 50%;
    }
</style>