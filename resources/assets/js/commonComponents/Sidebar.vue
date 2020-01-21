<template>
    <section class="h-full p-4 overflow-x-auto overflow-y-auto sidebar">
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
        <div class="pt-2">
            <component :is="currentTab" />
        </div>
    </section>
</template>

<script>
import GraphSidebar from "@/js/commonComponents/GraphSidebar";
import EditPosts from "@/js/commonComponents/EditPosts/EditPosts";
import LinkPosts from "@/js/commonComponents/LinkPosts/LinkPosts";
import LoadSave from "@/js/commonComponents/LoadSave";

export default {
    name: "Sidebar",
    components: {
        GraphSidebar,
        EditPosts,
        LinkPosts,
        LoadSave
    },
    data() {
        return {
            currentTab: "graph-sidebar", // | post-sidebar | edit-posts | link-posts | load-save,
            tabs: [
                {
                    key: "graph-sidebar",
                    name: "Graphs",
                },
                {
                    key: "edit-posts",
                    name: "Edit posts",
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
        min-width: 33%;
        background-color: #333;
        color: white;
    }
</style>
