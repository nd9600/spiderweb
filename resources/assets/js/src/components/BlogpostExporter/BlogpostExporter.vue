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
                    'input--error': postIdsError.isError
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
                    'input--error': linkIdsError.isError
                }"
                type="text"
                placeholder="1, 2, 3"
                minlength="0"
            >
            </textarea>
        </label>

        <button
            class="btn btn--secondary my-4 py-1 px-2"
            :disabled="postIdsError.isError || linkIdsError.isError"
            @click="exportBlogPost"
        >
            Export blog post
        </button>

        <div>
            Export:
            <div ref="export">
                <div v-if="postIdsError.isError || linkIdsError.isError">
                    <p class="whitespace-pre-wrap">
                        Post IDs error: {{ postIdsError.isError }}
                        {{ postIdsError.message }}

                    </p>
                    <p class="whitespace-pre-wrap">
                        Link IDs error: {{ linkIdsError.isError }}
                        {{ linkIdsError.message }}</p>
                </div>
                <article v-else>
                    <ExportedPost
                        v-for="postId in postIdsToExport"
                        :key="postId"
                        :post="dataStore.posts[postId]"
                        :linkIdsToExport="linkIdsToExport"
                    />
                </article>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
///// imports /////
import {computed, ref, useTemplateRef} from "vue";
import {isInteger} from "@/src/helpers/numberHelpers";
import ExportedPost from "./ExportedPost.vue";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "BlogpostExporter",
});

///// refs and variables /////
const dataStore = useDataStore();
const exportElement = useTemplateRef<HTMLElement>("export");
const postIdsString = ref("");
const linkIdsString = ref("");

///// computed /////
const postIdsToExport = computed(() => postIdsString.value
    .split(",")
    .map((s) => s.trim().split("\"").join(""))
    .filter((s) => s.length !== 0));

const linkIdsToExport = computed(() => linkIdsString.value
    .split(",")
    .map((s) => s.trim().split("\"").join(""))
    .filter((s) => s.length !== 0));

const invalidPostIds = computed(() => postIdsToExport.value
    .filter((postId) => !isValidPostId(postId)));

const invalidLinkIds = computed(() => linkIdsToExport.value
    .filter((linkId) => !isValidLinkId(linkId)));

const postIdsError = computed(() => {
    const isValid = postIdsToExport.value.length > 0
        && invalidPostIds.value.length === 0;
    return {
        isError: !isValid,
        message: `Has post IDs: ${postIdsToExport.value.length > 0}
Invalid post IDs: ${invalidPostIds.value}`
    };
});

const linkIdsError = computed(() => {
    const isValid = invalidLinkIds.value.length === 0;
    return {
        isError: !isValid,
        message: `Invalid link IDs: ${invalidLinkIds.value}`
    };
});

///// functions /////
function isValidPostId(postId: string): boolean {
    return isInteger(postId) && dataStore.posts[postId] != null;
}

function isValidLinkId(linkId: string): boolean {
    return isInteger(linkId) && dataStore.links[linkId] != null;
}

function exportBlogPost(): void {
    if (exportElement.value == null) {
        return;
    }

    const blob = new Blob(
        [exportElement.value.innerHTML],
        {type: "text/html"}
    );
    const now = new Date().toISOString()
        .replace("T", "_")
        .replace("Z", "");

    downloadData(blob, `blogPost-${now}.html`);
}

function downloadData(blob: Blob, filename: string): void {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";

    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}
</script>
