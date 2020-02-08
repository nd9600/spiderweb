<template>
    <div class="flex flex-col">
        <h1 class="h h--1">
            Add post
        </h1>

        <hr class="mb-5">

        <label
            class="mb-5 flex flex-col"
        >
            <button
                class="text-left underline"
                @click.prevent="toggleTitleInput"
            >
                Title
            </button>
            <input
                v-if="showTitleInput"
                ref="inputTitle"
                v-model="title"
                class="p-2 rounded text-gray-800 placeholder-gray-600"
                type="text"
                placeholder="On the Origin of Species"
                minlength="0"
                maxlength="1000"
            >
        </label>

        <label class="mb-5 flex flex-col">
            Body
            <textarea
                v-model="body"
                class="p-2 h-48 rounded text-gray-800 placeholder-gray-600 textareaBody"
                placeholder="But with regard to the material world, we can at least go so far as this—we can perceive that events are brought about not by insulated interpositions of Divine power, exerted in each particular case, but by the establishment of general laws"
                required="required"
                minlength="1"
                maxlength="10000"
            ></textarea>
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
import moment from "moment";
import {mapActions } from "vuex";

export default {
    name: "PostMaker",
    data() {
        return {
            showTitleInput: false,

            title: "",
            body: "",
        };
    },
    methods: {
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
                created_at: moment().format(),
                updated_at: moment().format(),
            };
            const newPostWithId = await this.makeNewPost(newPost);
            this.resetNewPost();
            this.$emit("madePost", newPostWithId);
        },
        resetNewPost() {
            this.title = "";
            this.body = "";
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