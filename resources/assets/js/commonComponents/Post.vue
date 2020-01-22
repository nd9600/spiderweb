<template>
    <section>
        <h1
            v-if="post.title.length > 0"
            class="h h--1 whitespace-pre-wrap"
        >{{ post.title }}</h1>
        <p class="whitespace-pre-wrap">{{ post.body }}</p>
    </section>
</template>

<script>
export default {
    name: "Post",
    props: {
        post: {
            type: Object,
            required: true
        }
    }
};
</script>

<style scoped>

</style>