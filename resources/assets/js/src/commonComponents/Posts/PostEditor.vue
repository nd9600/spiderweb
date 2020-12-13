<template>
    <section class="flex flex-col p-1 pb-0">
        <label
            class="mb-5 flex flex-col"
        >
            <button
                class="text-left font-bold"
                :class="title.trim().length > 0 ? 'cursor-default' : 'cursor-pointer underline'"
                @click.prevent="toggleTitleInput"
            >
                Title
            </button>
            <input
                v-if="showTitleInput"
                ref="inputTitle"
                :value="title"
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
                :value="body"
                @input="onBodyUpdate($event.target.value)"
                class="p-2 h-48 rounded border text-gray-800 placeholder-gray-600 resize-y"
                required="required"
                placeholder="you can type Markdown here"
                minlength="1"
                maxlength="10000"
            />
        </label>

        <span class="mb-2">
            <button
                class="btn btn--secondary"
                @click="removePostLocal"
            >
                delete
            </button>
        </span>
    </section>
</template>

<script>
import {mapActions, mapMutations} from "vuex";

export default {
    name: "PostEditor",
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            title: this.post.title,
            body: this.post.body,

            showTitleInput: this.post.title.length > 0,
        };
    },
    methods: {
        ...mapMutations("dataModule", ["deletePost"]),
        ...mapActions("dataModule", ["updatePostTitle", "updatePostBody"]),

        toggleTitleInput() {
            const dontLetUserHideTitleInput = this.showTitleInput
                && this.title.trim().length > 0;
            if (dontLetUserHideTitleInput) {
                this.$refs.inputTitle.focus();
                return;
            }
            this.showTitleInput = !this.showTitleInput;
        },

        removePostLocal() {
            if (!confirm("Are you sure you want to remove this post? ")) {
                return;
            }
            this.deletePost({
                id: this.post.id
            });
        },

        onTitleUpdate(title) {
            this.updatePostTitle({
                id: this.post.id,
                title,
                updatedAt: new Date().toISOString()
            });
            this.$root.$emit("refreshGraph");
        },
        onBodyUpdate(body) {
            this.updatePostBody({
                id: this.post.id,
                body,
                updatedAt: new Date().toISOString()
            });
            // this.$root.$emit("refreshGraph");
        }
    }
};
</script>