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
                class="p-2 h-48 rounded border text-gray-800 placeholder-gray-600 resize"
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
import {mapGetters, mapMutations} from "vuex";

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
            showTitleInput: this.post.title.length > 0,
        };
    },
    computed: {
        ...mapGetters("dataModule", ["titleOrBody"]),

        title: {
            get() {
                return this.post.title;
            },
            set(title) {
                this.updatePost({
                    ...this.post,
                    title,
                    updatedAt: new Date().toISOString()
                });
            }
        },
        body: {
            get() {
                return this.post.body;
            },
            set(body) {
                this.updatePost({
                    ...this.post,
                    body,
                    updatedAt: new Date().toISOString()
                });
            }
        },
    },
    methods: {
        ...mapMutations("dataModule", ["updatePost", "deletePost"]),

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
        }
    }
};
</script>