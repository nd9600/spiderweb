<template>
    <section class="flex flex-col">
        <div
            class="w-full flex"
            :class="{
                'justify-center': !inPostBar,
                'justify-start': inPostBar
            }"
        >
            <div
                :class="{
                    'md:w-2/3': !inPostBar,
                    'justify-between': !inPostBar,
                    'justify-start': inPostBar
                }"
                class="w-full flex items-center"
            >
                <span v-if="!inPostBar">
                    {{ titleOrBody(post.id) }}
                </span>
                <span>
                    <button
                        class="mt-4 mr-8 px-4 btn btn--secondary"
                        @click="showEditor = !showEditor"
                    >
                        {{ showEditor ? "Close" : "Edit" }}
                    </button>
                    <button
                        class="btn btn--primary"
                        @click="removePostLocal"
                    >
                        x
                    </button>
                </span>
            </div>
        </div>
        <div
            v-if="showEditor"
            class="my-2"
        >
            <label
                class="mb-5 flex flex-col"
            >
                <button
                    class="text-left underline"
                    :class="title.trim().length > 0 ? 'cursor-default' : 'cursor-pointer'"
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
                    class="p-2 h-48 rounded text-gray-800 placeholder-gray-600"
                    required="required"
                    minlength="1"
                    maxlength="10000"
                />
            </label>
        </div>

        <div class="flex justify-center">
            <hr class="my-4 w-2/3">
        </div>
    </section>
</template>

<script>
import {mapGetters, mapMutations} from "vuex";
import moment from "moment";

export default {
    name: "PostEditor",
    props: {
        post: {
            type: Object,
            required: true
        },
        inPostBar: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showEditor: false,
            showTitleInput: this.post.title.length > 0,
        };
    },
    computed: {
        ...mapGetters("postsModule", ["titleOrBody"]),

        title: {
            get() {
                return this.post.title;
            },
            set(title) {
                this.updatePost({
                    ...this.post,
                    title,
                    updated_at: moment().format()
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
                    updated_at: moment().format
                });
            }
        },
    },
    methods: {
        ...mapMutations("postsModule", ["updatePost", "removePost"]),

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
            this.removePost({
                id: this.post.id
            });
        }
    }
};
</script>

<style scoped>

</style>