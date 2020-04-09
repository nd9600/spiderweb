<template>
    <section>
        <p
            v-if="loadingApp"
            class="px-4 md:px-8"
        >
            loading..
        </p>
        <template v-else>
            <nav
                class="flex flex-wrap"
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
            </nav>
            <div class="min-h-full py-4 px-4 md:px-8 componentContainer">
                <component :is="currentTab" />
            </div>
        </template>
    </section>
</template>

<script>
import {mapState} from "vuex";

import Viewer from "@/js/commonComponents/Viewer/Viewer";
import Graphs from "@/js/commonComponents/Graphs/Graphs";
import LoadSave from "@/js/commonComponents/LoadSave";
import Settings from "@/js/commonComponents/Settings/Settings";

export default {
    name: "OfflineApp",
    components: {
        Viewer,
        Graphs,
        LoadSave,
        Settings
    },
    data() {
        return {
            currentTab: "viewer", // | viewer | graphs  | links | load-save | settings,
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
