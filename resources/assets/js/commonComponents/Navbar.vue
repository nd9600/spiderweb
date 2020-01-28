<template>
    <section class="h-full w-full p-4 sidebar">
        <div class="flex">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                class="optionBtn flex-grow"
                :class="{
                    'optionBtn--selected': currentTab === tab.key
                }"
                @click="currentTab = tab.key"
            >
                {{ tab.name }}
            </button>
        </div>
        <div class="h-full pt-2">
            <component :is="currentTab" />
        </div>
    </section>
</template>

<script>
import Viewer from "@/js/commonComponents/Viewer";
import GraphSidebar from "@/js/commonComponents/GraphSidebar";
import EditPosts from "@/js/commonComponents/EditPosts/EditPosts";
import LinkPosts from "@/js/commonComponents/LinkPosts/LinkPosts";
import LoadSave from "@/js/commonComponents/LoadSave";

export default {
    name: "Navbar",
    components: {
        Viewer,
        GraphSidebar,
        EditPosts,
        LinkPosts,
        LoadSave
    },
    data() {
        return {
            currentTab: "viewer", // | viewer | graph-sidebar | edit-posts | link-posts | load-save,
            tabs: [
                {
                    key: "viewer",
                    name: "Viewer",
                },
                {
                    key: "graph-sidebar",
                    name: "Graphs",
                },
                {
                    key: "edit-posts",
                    name: "Posts",
                },
                {
                    key: "link-posts",
                    name: "Link",
                },
                {
                    key: "load-save",
                    name: "Load/save",
                }
            ]
        };
    }
};
</script>

<style scoped>
    .sidebar {
        background-color: #eee;
        color: #333;
    }
</style>
