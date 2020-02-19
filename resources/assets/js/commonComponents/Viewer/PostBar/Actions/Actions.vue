<template>
    <div class="actionsContainer">
        <PostEditor
            :post="post"
            :inPostBar="true"
        />
        <AddLinkedPost :post="post" />
    </div>
</template>

<script>
import PostEditor from "@/js/commonComponents/Posts/PostEditor";
import AddLinkedPost from "./AddLinkedPost";

export default {
    name: "Actions",
    components: {
        PostEditor,
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

    background-color: #eeeeee;
    color: #333;
}
</style>