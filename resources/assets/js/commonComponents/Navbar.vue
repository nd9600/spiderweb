<template>
    <section class="p-4">
        <p v-if="loadingApp">
            loading..
        </p>
        <template v-else>
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
        </template>
    </section>
</template>

<script>
import {mapState} from "vuex";

import Viewer from "@/js/commonComponents/Viewer/Viewer";
import Graphs from "@/js/commonComponents/Graphs/Graphs";
import Posts from "@/js/commonComponents/Posts/Posts";
import Links from "@/js/commonComponents/Links/Links";
import LoadSave from "@/js/commonComponents/LoadSave";
import Settings from "@/js/commonComponents/Settings/Settings";

export default {
    name: "Navbar",
    components: {
        Viewer,
        Graphs,
        Posts,
        Links,
        LoadSave,
        Settings
    },
    data() {
        return {
            currentTab: "viewer", // | viewer | graphs | posts | links | load-save | settings,
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
                },
                {
                    key: "settings",
                    name: "Settings",
                }
            ]
        };
    },
    computed: {
        ...mapState(["loadingApp"])
    }
};
</script>

<style scoped>
    .componentContainer {
        background-color: #eee;
        color: #333;
    }
</style>
