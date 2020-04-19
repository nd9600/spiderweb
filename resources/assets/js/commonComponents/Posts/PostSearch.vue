<template>
    <span>
        <label>
            <input
                v-model="searchTerm"
                class="p-2 rounded text-gray-800 placeholder-gray-600 border"
                type="text"
                placeholder="On the Origin of Species"
                minlength="0"
                maxlength="50"
                title="search for a post"
            />
        </label>
        <span
            v-if="searchResults.length > 0"
            class="block"
        >
            <span
                v-for="post in searchResults"
                :key="post.id"
                class="cursor-pointer p-1 block hover:bg-red-300"
                @click="$emit('clickedOnResult', post)"
            >
                <span
                    v-if="post.title.length > 0"
                    class="font-bold"
                >
                    {{ post.title }}
                </span>
                <span>
                    {{ post.body.substr(0, 30) }}{{ post.body.length > 30 ? "..." : "" }}
                </span>
            </span>
        </span>
    </span>
</template>

<script>
import {mapState, mapGetters} from "vuex";
export default {
    name: "PostSearch",
    data() {
        return {
            searchTerm: ""
        };
    },
    computed: {
        ...mapState("postsModule", ["posts"]),
        ...mapGetters("postsModule", ["titleOrBody", "postIdsThatLinkToPost"]),

        searchResults() {
            const searchTerm = this.searchTerm.trim().toLowerCase();
            if (searchTerm.length === 0) {
                return [];
            }

            return Object.values(this.posts)
                .filter(post =>
                    post.title.toLowerCase().includes(searchTerm)
                    || post.body.toLowerCase().includes(searchTerm)
                ).sort((postA, postB) => {
                    const postAStringToCompare = postA.title.length > 0
                        ? postA.title
                        : postA.body;
                    const postBStringToCompare = postB.title.length > 0
                        ? postB.title
                        : postB.body;

                    if (postAStringToCompare < postBStringToCompare) {
                        return -1;
                    } else if (postBStringToCompare < postAStringToCompare) {
                        return 1;
                    } else {
                        return 0;
                    }
                }).slice(0, 25);
        }
    },
};
</script>