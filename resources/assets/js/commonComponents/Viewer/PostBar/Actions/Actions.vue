<template>
    <div class="actionsContainer">
        <AddLinkedPost
            :post="post"
        />
    </div>
</template>

<script>
import AddLinkedPost from "./AddLinkedPost";

export default {
    name: "Actions",
    components: {
        AddLinkedPost
    },
    props: {
        post: {
            type: Object,
            required: true
        }
    }
};
</script>

<style scoped>
.actionsContainer {
    padding: 1rem 1rem 0 1rem;

    background-color: #eee;
    color: #333;
}
</style>