<template>
    <section class="section font-sans markdownContent">
        <div :id="`section-${post.id}`">
            <h2
                v-if="post.title.length > 0"
                class="h h--2"
            >
                {{ titleOrBody(post.id) }}
            </h2>
        </div>

        <div v-if="linksToPost.length > 0">
            <h3 class="h h--3">
                Links to this section:
            </h3>
            <ul>
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

        <div v-if="linksFromPost.length > 0">
            <h3 class="h h--3">
                Links from this section:
            </h3>
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
        ...mapGetters("dataModule", ["postIds", "linkIds", "titleOrBody", "postIdsThatLinkToPost"]),

        linkedPosts() {
            return this.postIdsThatLinkToPost(this.post.id);
        },
        linksToPost() {
            return Object.entries(this.linkedPosts.to)
                .filter(([linkId, linkToPostId]) => this.linkIds.includes(linkId));
        },
        linksFromPost() {
            return Object.entries(this.linkedPosts.from)
                .filter(([linkId, linkFromPostId]) => this.linkIds.includes(linkId));
        }
    },
    methods: {
        marked
    }
};
</script>

<style scoped>

</style>