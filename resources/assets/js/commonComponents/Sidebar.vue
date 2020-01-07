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
            <keep-alive>
                <component
                    :is="currentComponent"
                />
            </keep-alive>
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
    computed: {
        currentComponent() {
            switch (this.currentTab) {
                case "posts": {
                    return "post-sidebar";
                }
                case "makePosts": {
                    return "post-maker";
                }
                case "linkPosts": {
                    return "link-posts";
                }
                case "loadSave": {
                    return "load-save";
                }
                default: {
                    return "post-sidebar";
                }
            }
        }
    }
};
</script>

<style scoped>
    .sidebar {
        background-color: #333;
        color: white;
    }
</style>
