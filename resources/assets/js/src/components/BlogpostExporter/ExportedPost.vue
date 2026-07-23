<template>
    <section
        :id="`section-${post.id}`"
        class="section font-sans markdownContent"
    >
        <h2
            v-if="post.title.length > 0"
            class="h h--2 section__header"
        >
            {{ dataStore.titleOrBody(post.id) }}
        </h2>

        <div
            v-if="linksToPost.length > 0"
            class="section__links section__links--to"
        >
            <h4 class="h h--4 section__links__header">
                Links to this section:
            </h4>
            <ul class="section__links__list">
                <li
                    v-for="[linkId, sourcePostId] in linksToPost"
                    :key="linkId"
                >
                    <a
                        class="link section__link section__link--to"
                        :data-source-id="post.id"
                        :data-source-text="dataStore.titleOrBody(post.id)"
                        :data-target-id="sourcePostId"
                        :data-target-text="dataStore.titleOrBody(sourcePostId)"
                        :href="`#section-${sourcePostId}`"
                    >
                        {{ dataStore.titleOrBody(sourcePostId) }}
                    </a>
                </li>
            </ul>
        </div>

        <div v-html="renderedBody"></div>

        <div
            v-if="linksFromPost.length > 0"
            class="section__links section__links--from"
        >
            <h4 class="h h--4 section__links__header">
                Links from this section:
            </h4>
            <ul class="section__links__list">
                <li
                    v-for="[linkId, targetPostId] in linksFromPost"
                    :key="linkId"
                >
                    <a
                        class="link section__link section__link--from"
                        :data-source-id="post.id"
                        :data-source-text="dataStore.titleOrBody(post.id)"
                        :data-target-id="targetPostId"
                        :data-target-text="dataStore.titleOrBody(targetPostId)"
                        :href="`#section-${targetPostId}`"
                    >
                        {{ dataStore.titleOrBody(targetPostId) }}
                    </a>
                </li>
            </ul>
        </div>
    </section>
</template>

<script setup lang="ts">
///// imports /////
import {computed} from "vue";
import marked from "@/src/helpers/markedCustomised";
import type {LinkId} from "@/src/@types/StoreTypes";
import type {Post} from "@/src/store/models/Post";
import type {LinkedPostIds} from "@/src/store/modules/dataModule";
import {useDataStore} from "@/src/store";

defineOptions({
    name: "ExportedPost",
});

const props = defineProps<{
    post: Post;
    linkIdsToExport: LinkId[];
}>();

///// refs and variables /////
const dataStore = useDataStore();
const emptyLinkedPostIds: LinkedPostIds = {
    from: {},
    to: {},
};

///// computed /////
const linkedPosts = computed(() => dataStore.linksByPostId[props.post.id] ?? emptyLinkedPostIds);
const linkIdsToExportSet = computed(() => new Set(props.linkIdsToExport));
const linksToPost = computed(() => Object.entries(linkedPosts.value.to)
    .filter(([linkId]) => linkIdsToExportSet.value.has(linkId)));
const linksFromPost = computed(() => Object.entries(linkedPosts.value.from)
    .filter(([linkId]) => linkIdsToExportSet.value.has(linkId)));
const renderedBody = computed(() => marked(props.post.body));
</script>
