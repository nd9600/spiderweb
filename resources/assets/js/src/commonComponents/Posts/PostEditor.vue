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
                @input="onTitleInput"
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
                @input="onBodyInput"
                class="p-2 h-64 rounded border text-gray-800 placeholder-gray-600 resize-y"
                placeholder="you can type Markdown here"
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

<script lang="ts">
import {defineComponent, PropType} from "vue";
import {mapActions} from "pinia";
import type {PostSerialised} from "@/src/offline/store/classes/Post";
import {useDataStore} from "@/src/offline/store";

export default defineComponent({
    name: "PostEditor",
    props: {
        post: {
            type: Object as PropType<PostSerialised>,
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
        ...mapActions(useDataStore, ["deletePost", "updatePostTitle", "updatePostBody"]),

        toggleTitleInput() {
            const dontLetUserHideTitleInput = this.showTitleInput
                && this.title.trim().length > 0;
            if (dontLetUserHideTitleInput) {
                (this.$refs.inputTitle as HTMLInputElement).focus();
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

        onTitleInput(event: Event) {
            const title = (event.target as HTMLInputElement | null)?.value;
            if (title == null) {
                return;
            }
            this.onTitleUpdate(title);
        },
        onTitleUpdate(title: string) {
            this.updatePostTitle({
                id: this.post.id,
                title,
                updatedAt: new Date().toISOString()
            });
        },
        onBodyInput(event: Event) {
            const body = (event.target as HTMLTextAreaElement | null)?.value;
            if (body == null) {
                return;
            }
            this.onBodyUpdate(body);
        },
        onBodyUpdate(body: string) {
            this.updatePostBody({
                id: this.post.id,
                body,
                updatedAt: new Date().toISOString()
            });
        }
    }
});
</script>
