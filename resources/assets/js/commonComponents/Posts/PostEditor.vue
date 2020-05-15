<template>
    <section class="flex flex-col editorContainer">
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
.editorContainer {
    padding: 1rem 1rem 0 1rem;

    background-color: #eeeeee;
    color: #333;
}
</style>