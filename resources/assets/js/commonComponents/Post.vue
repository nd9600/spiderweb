<template>
    <section>
        <h1
            v-if="post.title.length > 0"
            class="h h--1 whitespace-pre"
        >{{ post.title }}</h1>
        <p class="whitespace-pre">{{ post.body }}</p>
    </section>
</template>

<script>
export default {
    name: "Post",
    props: {
        post: {
            type: Object,
            required: true
            /*
            {
                    "user_id": 1,
                    "title": "Foo",
                    "body": "Foo body",
                    "created_at": moment().format(),
                    "updated_at": moment().format(),
                }
             */
        }
    }
};
</script>

<style scoped>

</style>