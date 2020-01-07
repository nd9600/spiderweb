<template>
    <div class="flex flex-col">
        <h1 class="h h--1">
            Link posts
        </h1>

        <hr class="mb-5">

        <section>
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
    </div>
</template>

<script>
import {mapState, mapGetters } from "vuex";
import PostLinker from "./PostLinker";
import Linker from "./Linker";

export default {
    name: "LinkPosts",
    components: {
        PostLinker,
        Linker
    },
    computed: {
        ...mapState("postsModule", ["posts"]),
        ...mapGetters("postsModule", ["unlinkedPosts"])
    }
};
</script>