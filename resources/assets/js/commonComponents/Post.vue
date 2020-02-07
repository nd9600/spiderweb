<template>
    <section class="relative post">
        <button
            class="absolute right-0 mr-2 btn btn--primary opacity-25 hover:opacity-100"
            @click="unselectPostId(post.id)"
        >
            x
        </button>
        <h1
            v-if="post.title.length > 0"
            class="h h--1 whitespace-pre-wrap"
        >{{ post.title }}</h1>
        <p class="whitespace-pre-wrap">{{ post.body }}</p>
    </section>
</template>

<script>
import {mapMutations} from "vuex";

export default {
    name: "Post",
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    methods: {
        ...mapMutations("postsModule", ["unselectPostId"]),
    }
};
</script>

<style scoped>
    .post {
        min-width: 92%;
        max-height: 66vh;
        background: white;

        overflow-y: auto;
    }

    @media (min-width: 768px) {
        .post {
            min-width: 48%;
        }
    }
</style>