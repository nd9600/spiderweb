<template>
    <div class="flex flex-col items-start">
        <h1 class="h h--1">
            Link posts
        </h1>

        <hr class="mb-5">

        <section
            v-if="unlinkedPosts.length > 0"
            class="w-full"
        >
            <h2
                class="h h--2"
                title="posts that aren't in any graph yet"
            >
                Unlinked posts
            </h2>

            <UnlinkedPostLinker
                v-for="post in unlinkedPosts"
                :key="post.id"
                :post="post"
            />
        </section>

        <LinkMaker class="w-full"/>

        <button
            v-if="Object.keys(links).length > 0"
            class="btn btn--secondary"
            @click="shouldShowLinks = !shouldShowLinks"
        >
            {{ shouldShowLinks ? "Hide" : "Show" }} links
        </button>

        <section
            v-if="shouldShowLinks"
            class="w-full"
        >
            <h2 class="h h--2">
                Links
            </h2>

            <table class="w-full text-sm">
                <thead>
                    <tr>
                        <td>Source</td>
                        <td>Target</td>
                        <td>Graph</td>
                        <td>Type</td>
                        <td>Remove</td>
                    </tr>
                </thead>
                <tbody>
                    <LinkEditor
                        v-for="link in links"
                        :key="link.id"
                        :link="link"
                    />
                </tbody>
            </table>
        </section>
    </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import UnlinkedPostLinker from "./UnlinkedPostLinker";
import LinkMaker from "./LinkMaker";
import LinkEditor from "./LinkEditor";

export default {
    name: "Links",
    components: {
        UnlinkedPostLinker,
        LinkMaker,
        LinkEditor
    },
    data() {
        return {
            shouldShowLinks: true
        };
    },
    computed: {
        ...mapState("postsModule", ["posts", "links"]),
        ...mapGetters("postsModule", ["unlinkedPosts"])
    }
};
</script>