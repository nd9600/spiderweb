<template>
    <div class="cursor-pointer p-1 hover:bg-red-300">
        <span
            v-if="post.title.length > 0"
            class="font-bold"
        >
            {{ post.title }}
        </span>
        <span>
            {{ post.body.substr(0, 30) }}{{ post.body.length > 30 ? "..." : "" }}
        </span>
    </div>
</template>
<script>
export default {
    name: "UnattachedPost",
    props: {
        post: {
            type: Object,
            required: true
        }
    }
};
</script>