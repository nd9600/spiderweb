<template>
    <div>
        <label>
            <input
                ref="searchInput"
                v-model="searchTerm"
                class="p-2 w-full input input--primary"
                type="text"
                placeholder="On the Origin of Species"
                minlength="0"
                maxlength="50"
                title="search for a post"
            />
        </label>
        <div
            v-if="isLoadingSearchResults"
            class="mt-1 flex justify-center items-center"
        >
            <div class="spinner"></div>
        </div>
        <div v-else-if="searchResults.length > 0">
            <div
                v-for="post in searchResults"
                :key="post.id"
                class="mt-2 p-1 cursor-pointer bg-red-200 hover:bg-red-300 rounded-lg"
                @click="$emit('clickedOnResult', post)"
            >
                <span
                    v-if="post.title.length > 0"
                    class="font-bold"
                >
                    {{ post.title }}
                </span>
                <p
                    v-if="post.body.length > 0"
                    class="text-xs"
                >
                    {{ post.body.substr(0, 200) }}{{ post.body.length > 200 ? "..." : "" }}
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState, mapGetters} from "vuex";
export default {
    name: "PostSearch",
    data() {
        return {
            searchTerm: "",
            isLoadingSearchResults: false,
            searchResults: []
        };
    },
    computed: {
        ...mapState("dataModule", ["posts"]),
        ...mapGetters("dataModule", ["titleOrBody", "postIdsThatLinkToPost"]),
    },
    watch: {
        searchTerm(newSearchTerm) {
            const searchTerm = newSearchTerm.trim().toLowerCase();
            if (searchTerm.length === 0) {
                this.searchResults = [];
                this.isLoadingSearchResults = false;
                return;
            }
            this.isLoadingSearchResults = true;

            this.searchResults = Object.values(this.posts)
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
            this.isLoadingSearchResults = false;
        }
    },
    mounted() {
        this.$refs.searchInput.focus();
    }
};
</script>