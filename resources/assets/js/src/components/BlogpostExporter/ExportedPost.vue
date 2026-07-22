<template>
    <section
        :id="`section-${post.id}`"
        class="section font-sans markdownContent"
    >
        <h2
            v-if="post.title.length > 0"
            class="h h--2 section__header"
        >
            {{ titleOrBody(post.id) }}
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
                        :data-source-text="titleOrBody(post.id)"
                        :data-target-id="sourcePostId"
                        :data-target-text="titleOrBody(sourcePostId)"
                        :href="`#section-${sourcePostId}`"
                    >
                        {{ titleOrBody(sourcePostId) }}
                    </a>
                </li>
            </ul>
        </div>

        <div v-html="marked(post.body)"></div>

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
                        :data-source-text="titleOrBody(post.id)"
                        :data-target-id="targetPostId"
                        :data-target-text="titleOrBody(targetPostId)"
                        :href="`#section-${targetPostId}`"
                    >
                        {{ titleOrBody(targetPostId) }}
                    </a>
                </li>
            </ul>
        </div>
    </section>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import marked from "@/src/helpers/markedCustomised";
import type {LinkId} from "@/src/@types/StoreTypes";
import type {Post} from "@/src/store/models/Post";
import {useDataStore} from "@/src/store";

export default defineComponent({
    name: "ExportedPost",
    props: {
        post: {
            type: Object as PropType<Post>,
            required: true
        },
        linkIdsToExport: {
            type: Array as PropType<LinkId[]>,
            required: true
        }
    },
    computed: {
        titleOrBody() {
            return useDataStore().titleOrBody;
        },
        postIdsThatLinkToPost() {
            return useDataStore().postIdsThatLinkToPost;
        },

        linkedPosts() {
            return this.postIdsThatLinkToPost(this.post.id);
        },
        linksToPost() {
            return Object.entries(this.linkedPosts.to)
                .filter(([linkId, linkToPostId]) => {
                    return this.linkIdsToExport.includes(linkId);
                });
        },
        linksFromPost() {
            return Object.entries(this.linkedPosts.from)
                .filter(([linkId, linkFromPostId]) => this.linkIdsToExport.includes(linkId));
        }
    },
    methods: {
        marked
    }
});
</script>
