<template>
    <section class="flex flex-col">
        <div v-if="showEditor">
            <label
                class="mb-5 flex flex-col items-start"
            >
                <button
                    class="mb-2 btn btn--secondary"
                    @click="showEditor = false"
                >
                    Hide editor
                </button>
                <input
                    v-if="showTitleInput"
                    ref="inputTitle"
                    v-model="title"
                    class="p-2 rounded text-gray-800 placeholder-gray-600"
                    type="text"
                    placeholder="On the Origin of Species"
                    minlength="0"
                    maxlength="100"
                >
            </label>

            <label class="mb-5 flex flex-col">
                Body
                <textarea
                    v-model="body"
                    class="p-2 h-48 rounded text-gray-800 placeholder-gray-600 textareaBody"
                    required="required"
                    minlength="1"
                    maxlength="10000"
                />
            </label>

            <button
                class="py-1 px-2 btn btn--secondary"
                @click="removePostLocal"
            >
                Remove
            </button>
        </div>
        <div
            v-else
            class="w-full flex justify-center"
        >
            <div class="w-2/3 flex items-center justify-between">
                <span>
                    {{ post.title.length > 0 ? post.title : post.body.substr(0, 20) }}
                </span>
                <button
                    class="btn btn--secondary"
                    @click="showEditor = true"
                >
                    Show editor
                </button>
                <button
                    class="py-1 px-2 btn btn--primary"
                    @click="removePostLocal"
                >
                    x
                </button>
            </div>
        </div>

        <div class="flex justify-center">
            <hr class="my-4 w-2/3">
        </div>
    </section>
</template>

<script>
import { mapMutations} from "vuex";
import moment from "moment";

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
            showEditor: false,
            showTitleInput: this.post.title.length > 0,
        };
    },
    computed: {
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
            this.removePost({
                id: this.post.id
            });
        }
    }
};
</script>

<style scoped>

</style>