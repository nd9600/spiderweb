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
                        class="link"
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
            <ul>
                <li
                    v-for="[linkId, targetPostId] in linksFromPost"
                    :key="linkId"
                >
                    <a
                        class="link"
                        :href="`#section-${targetPostId}`"
                    >
                        {{ titleOrBody(targetPostId) }}
                    </a>
                </li>
            </ul>
        </div>
    </section>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import marked from "@/src/helpers/markedCustomised";

export default {
    name: "ExportedPost",
    props: {
        post: {
            type: Object,
            required: true
        },
        linkIdsToExport: {
            type: Array,
            required: true
        }
    },
    computed: {
        ...mapState("dataModule", ["posts", "links"]),
        ...mapGetters("dataModule", ["postIds", "titleOrBody", "postIdsThatLinkToPost"]),

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
};
</script>