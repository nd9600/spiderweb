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
            <button
                class="btn btn--secondary flex-grow"
                @click="currentTab = 'loadSave'"
            >
                Load/save
            </button>
        </div>
        <div class="pt-2">
            <template v-if="currentTab === 'posts'">
                <post-sidebar/>
            </template>
            <template v-if="currentTab === 'makePosts'">
                <post-maker/>
            </template>
            <template v-if="currentTab === 'loadSave'">
                <load-save/>
            </template>
        </div>
    </section>
</template>

<script>
import PostSidebar from "@/js/commonComponents/PostSidebar";
import PostMaker from "@/js/commonComponents/PostMaker";
import LoadSave from "@/js/commonComponents/LoadSave";

export default {
    name: "Sidebar",
    components: {
        PostSidebar,
        PostMaker,
        LoadSave
    },
    data() {
        return {
            currentTab: "posts", // | posts | makePosts | loadSave
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
