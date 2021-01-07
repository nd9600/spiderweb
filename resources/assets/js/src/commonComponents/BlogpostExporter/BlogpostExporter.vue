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
            <div ref="export">
                <article v-if="!postIdsStringIsValid || !linkIdsStringIsValid">
                    invalid
                </article>
                <article v-else>
                    <ExportedPost
                        v-for="postId in postIdsToExport"
                        :key="postId"
                        :post="posts[postId]"
                        :linkIdsToExport="linkIdsToExport"
                    />
                </article>
            </div>
        </div>
    </div>
</template>

<script>
import {isInteger} from "@/src/helpers/numberHelpers";
import {mapGetters, mapState} from "vuex";
import ExportedPost from "./ExportedPost";

export default {
    name: "BlogpostExporter",
    components: {ExportedPost},
    data() {
        return {
            postIdsString: ``,
            linkIdsString: ``,
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
    },
    methods: {
        exportBlogPost() {
            const blob = new Blob(
                [this.$refs["export"].innerHTML],
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