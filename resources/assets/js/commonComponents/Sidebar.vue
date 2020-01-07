<template>
    <section class="h-full w-1/3 p-4 sidebar">
        <div class="flex">
            <button
                class="optionBtn flex-grow"
                :class="{
                    'optionBtn--selected': currentTab === 'posts'
                }"
                @click="currentTab = 'posts'"
            >
                Posts
            </button>

            <button
                class="optionBtn flex-grow"
                :class="{
                    'optionBtn--selected': currentTab === 'makePosts'
                }"
                @click="currentTab = 'makePosts'"
            >
                Make posts
            </button>

            <button
                class="optionBtn flex-grow"
                :class="{
                    'optionBtn--selected': currentTab === 'linkPosts'
                }"
                @click="currentTab = 'linkPosts'"
            >
                Link posts
            </button>

            <button
                class="optionBtn flex-grow"
                :class="{
                    'optionBtn--selected': currentTab === 'loadSave'
                }"
                @click="currentTab = 'loadSave'"
            >
                Load/save
            </button>
        </div>
        <div class="pt-2">
            <template v-if="currentTab === 'posts'">
                <post-sidebar />
            </template>

            <template v-if="currentTab === 'makePosts'">
                <post-maker />
            </template>

            <template v-if="currentTab === 'linkPosts'">
                <link-posts />
            </template>

            <template v-if="currentTab === 'loadSave'">
                <load-save />
            </template>
        </div>
    </section>
</template>

<script>
import PostSidebar from "@/js/commonComponents/PostSidebar";
import PostMaker from "@/js/commonComponents/PostMaker";
import LinkPosts from "@/js/commonComponents/LinkPosts/LinkPosts";
import LoadSave from "@/js/commonComponents/LoadSave";

export default {
    name: "Sidebar",
    components: {
        PostSidebar,
        PostMaker,
        LinkPosts,
        LoadSave
    },
    data() {
        return {
            currentTab: "posts", // | posts | makePosts | linkPosts | loadSave
        };
    },
};
</script>

<style scoped>
    .sidebar {
        background-color: #333;
        color: white;
    }
</style>
