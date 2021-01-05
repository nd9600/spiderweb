<template>
    <div class="flex flex-col items-start">
        <h2 class="h h--2">
            Blogpost exporter
        </h2>

        <label class="my-4 flex">
            Node IDs:
            <textarea
                v-model="postIdsString"
                class="ml-4 p-2 rounded border text-gray-800 placeholder-gray-600"
                :class="{
                    'input--error': !postIdsStringIsValid
                }"
                type="text"
                placeholder="1, 2, 3"
                minlength="0"
            >
            </textarea>
        </label>

        <label class="my-4 flex">
            Link IDs:
            <textarea
                v-model="linkIdsString"
                class="ml-4 p-2 rounded border text-gray-800 placeholder-gray-600"
                :class="{
                    'input--error': !linkIdsStringIsValid
                }"
                type="text"
                placeholder="1, 2, 3"
                minlength="0"
            >
            </textarea>
        </label>

        <button
            class="btn btn--secondary my-4 py-1 px-2"
            :disabled="!postIdsStringIsValid || !linkIdsStringIsValid"
            @click="exportBlogPost"
        >
            Export blog post
        </button>

        <div>
            Export:
            <p v-html="exportingData"></p>
        </div>
    </div>
</template>

<script>
import marked from "@/src/helpers/markedCustomised";
import {isInteger} from "@/src/helpers/numberHelpers";
import {mapGetters, mapState} from "vuex";

export default {
    name: "BlogpostExporter",
    data() {
        return {
            postIdsString: "",
            linkIdsString: "",
        };
    },
    computed: {
        ...mapState("dataModule", ["posts", "links"]),
        ...mapGetters("dataModule", ["postIds", "linkIds"]),

        postIdsToExport() {
            return this.postIdsString
                .split(",")
                .map((s) => s.trim().replaceAll('"', ""))
                .filter((s) => s.length !== 0);
        },

        linkIdsToExport() {
            return this.linkIdsString
                .split(",")
                .map((s) => s.trim().replaceAll('"', ""))
                .filter((s) => s.length !== 0);
        },

        postIdsStringIsValid() {
            return this.postIdsToExport.length > 0
                && this.postIdsToExport
                    .every((postId) => isInteger(postId) && this.postIds.includes(postId));
        },
        linkIdsStringIsValid() {
            return this.linkIdsToExport.length === 0
                || this.linkIdsToExport
                    .every((linkId) => isInteger(linkId) && this.linkIds.includes(linkId));
        },
        exportingData() {
            if (!this.postIdsStringIsValid || !this.linkIdsStringIsValid) {
                return "INVALID";
            }
            return this.postIdsToExport
                .map(postId => {
                    const post = this.posts[postId];
                    const postTitle = post.title.length > 0
                        ? `<h3 class="h h--3 mr-2 whitespace-pre-wrap">${post.title}</h3>`
                        : "";
                    const postBodyRendered = `<div class="font-sans markdownContent">${marked(post.body)}</div>`;

                    return `<section class="post">
${postTitle}
${postBodyRendered}
</section>`;
                })
                .join("\n");
        }
    },
    methods: {
        exportBlogPost() {
            const blob = new Blob(
                [this.exportingData],
                {type: "text/html"}
            );
            const now = new Date().toISOString()
                .replace("T", "_")
                .replace("Z", "");

            this.downloadData(blob, `blogPost-${now}.html`);
        },
        downloadData(blob, filename) {
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";

            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }
};
</script>

<style scoped>
.input--error {
    border: 1px solid var(--red-dark);
    background-color: #ffdbdb;
}
</style>