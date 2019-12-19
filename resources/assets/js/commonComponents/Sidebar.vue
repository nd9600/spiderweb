<template>
    <section class="h-full w-1/3 p-4 sidebar">
        <div class="flex">
            <button
                class="btn btn--secondary flex-grow"
                @click="currentTab = 'posts'"
            >
                Posts
            </button>
            <button
                class="btn btn--secondary flex-grow"
                @click="currentTab = 'makePosts'"
            >
                Make posts
            </button>
        </div>
        <div>
            <template v-if="currentTab === 'posts'">
                <post
                    v-if="selectedPostId !== null"
                    :post="posts[selectedPostId]"
                >
                </post>
            </template>
            <template v-if="currentTab === 'makePosts'">
                <post-maker></post-maker>
            </template>
        </div>
    </section>
</template>

<script>
import Post from "@/js/commonComponents/Post";
import PostMaker from "@/js/commonComponents/PostMaker";

export default {
    name: "Sidebar",
    components: {
        Post,
        PostMaker
    },
    props: {
        selectedPostId: {
            type: Number,
            required: false,
            default: null
        },
        posts: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            currentTab: "posts", // | posts | makePosts
        };
    }
};
</script>

<style scoped>
    .sidebar {
        background-color: #333;
        color: white;
    }
</style>