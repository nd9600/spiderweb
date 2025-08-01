<template>
    <section>
        <div
            v-if="loadingApp"
            class="px-4 md:px-8"
        >
            loading..
            <br>
            (this will timeout in 10 seconds)

            <div
                v-if="failedToLoadData"
                class="mt-4"
            >
                <p class="text-red font-bold">
                    Couldn't load data from Firebase
                </p>

                <button
                    class="btn btn--primary"
                    type="button"
                    @click="refreshPage"
                >
                    Refresh
                </button>

                <button
                    class="btn btn--secondary"
                    type="button"
                    @click="switchToLoadingDataFromLocalStorage"
                >
                    Load data from Local Storage instead
                </button>
                <sub class="my-2 text-xs text-gray-500">
                    (any data stored in Firebase will still be there)
                </sub>
            </div>
        </div>
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
                <keep-alive>
                    <component :is="currentTab" />
                </keep-alive>
            </div>
        </template>
    </section>
</template>

<script>
import { useAppStore, useSettingsStore } from "@/src/stores";

import Viewer from "@/src/commonComponents/Viewer/Viewer.vue";
import Graphs from "@/src/commonComponents/Graphs/Graphs.vue";
import LoadSave from "@/src/commonComponents/LoadSave.vue";
import Settings from "@/src/commonComponents/Settings/Settings.vue";

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
        appStore() {
            return useAppStore();
        },
        settingsStore() {
            return useSettingsStore();
        },
        loadingApp() {
            return this.appStore.loadingApp;
        },
        failedToLoadData() {
            return this.appStore.failedToLoadData;
        }
    },
    methods: {

        refreshPage() {
            window.location.reload();
        },

        async switchToLoadingDataFromLocalStorage() {
            this.settingsStore.setRemoteStorageMethod("none");
            await this.appStore.loadDataFrom("local");
            await this.appStore.loadStateFromStorage();
        }
    }
};
</script>

<style scoped>
    .componentContainer {
        background-color: #eee;
        color: #333;
    }
</style>
