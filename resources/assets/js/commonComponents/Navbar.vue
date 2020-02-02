<template>
    <section class="h-full w-full p-4">
        <div
            class="flex"
            style="border-bottom: 5px solid var(--red);"
        >
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
        <div class="min-h-full p-4 componentContainer">
            <component :is="currentTab" />
        </div>
    </section>
</template>

<script>
import Viewer from "@/js/commonComponents/Viewer";
import Graphs from "@/js/commonComponents/Graphs/Graphs";
import Posts from "@/js/commonComponents/Posts/Posts";
import Links from "@/js/commonComponents/Links/Links";
import LoadSave from "@/js/commonComponents/LoadSave";

export default {
    name: "Navbar",
    components: {
        Viewer,
        Graphs,
        Posts,
        Links,
        LoadSave
    },
    data() {
        return {
            currentTab: "viewer", // | viewer | graphs | posts | links | load-save,
            tabs: [
                {
                    key: "viewer",
                    name: "Viewer",
                },
                {
                    key: "graphs",
                    name: "Graphs",
                },
                {
                    key: "posts",
                    name: "Posts",
                },
                {
                    key: "links",
                    name: "Links",
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
    .componentContainer {
        background-color: #eee;
        color: #333;
    }
</style>
