<template>
    <section class="h-full w-1/3 p-4 sidebar">
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
            <keep-alive>
                <component :is="currentTab" />
            </keep-alive>
        </div>
    </section>
</template>

<script>
import PostSidebar from "@/js/commonComponents/PostSidebar";
import EditPosts from "@/js/commonComponents/EditPosts/EditPosts";
import LinkPosts from "@/js/commonComponents/LinkPosts/LinkPosts";
import LoadSave from "@/js/commonComponents/LoadSave";

export default {
    name: "Sidebar",
    components: {
        PostSidebar,
        EditPosts,
        LinkPosts,
        LoadSave
    },
    data() {
        return {
            currentTab: "post-sidebar", // | post-sidebar | edit-posts | link-posts | load-save,
            tabs: [
                {
                    key: "post-sidebar",
                    name: "Posts",
                },
                {
                    key: "edit-posts",
                    name: "Edit posts",
                },
                {
                    key: "link-posts",
                    name: "Link posts",
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
        background-color: #333;
        color: white;
    }
</style>
