<template>
    <div>
        <h1 class="h h--1">
            Make posts
        </h1>

        <hr>

        <label>
            Title
            <input
                v-model="title"
                type="text"
                placeholder="On the Origin of Species"
                maxlength="100"
            >
        </label>

        <label>
            Body
            <textarea
                v-model="body"
                placeholder="But with regard to the material world, we can at least go so far as this—we can perceive that events are brought about not by insulated interpositions of Divine power, exerted in each particular case, but by the establishment of general laws"
            ></textarea>
        </label>

        <hr>
        <button
            type="submit"
            class="btn btn--primary"
            @click="makePost"
        >
            Create
        </button>
    </div>
</template>

<script>
import moment from "moment";
export default {
    name: "PostMaker",
    data() {
        return {
            title: "",
            body: "",
        };
    },
    methods: {
        makePost() {
            const newPost = {
                title: this.title,
                body: this.body,
                created_at: moment().format(),
                updated_at: moment().format(),
            };
            console.log(newPost);
        }
    }
};
</script>

<style scoped>

</style>