<template>
    <div class="flex flex-col">
        <h1 class="h h--1">
            Link posts
        </h1>

        <hr class="mb-5">

        <section v-if="unlinkedPosts.length > 0">
            <h2
                class="h h--2"
                title="posts that aren't in any graph yet"
            >
                Unlinked posts
            </h2>

            <post-linker
                v-for="post in unlinkedPosts"
                :key="post.id"
                :post="post"
            />
        </section>

        <section>
            <linker/>
        </section>

        <section v-if="links.length > 0">
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
                    <link-row
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
import PostLinker from "./PostLinker";
import Linker from "./Linker";
import LinkRow from "./LinkRow";

export default {
    name: "LinkPosts",
    components: {
        PostLinker,
        Linker,
        LinkRow
    },
    computed: {
        ...mapState("postsModule", ["posts", "links"]),
        ...mapGetters("postsModule", ["unlinkedPosts"])
    }
};
</script>