<template>
    <section class="w-full h-full" >
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
            <div class="min-h-full py-4 px-4 md:px-8" style="background-color: #eee; color: #333;">
                <keep-alive>
                    <component :is="currentTab" />
                </keep-alive>
            </div>
        </template>
    </section>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {mapActions, mapState} from "pinia";

import Viewer from "@/src/components/Viewer/Viewer.vue";
import Graphs from "@/src/components/Graphs/Graphs.vue";
import LoadSave from "@/src/components/LoadSave.vue";
import Settings from "@/src/components/Settings/Settings.vue";
import {useRootStore, useSettingsStore} from "@/src/store";

enum AppTab {
    Viewer = "viewer",
    Graphs = "graphs",
    LoadSave = "load-save",
    Settings = "settings",
}

export default defineComponent({
    name: "App",
    components: {
        Viewer,
        Graphs,
        LoadSave,
        Settings
    },
    data() {
        return {
            currentTab: AppTab.Viewer,
            tabs: [
                {
                    key: AppTab.Viewer,
                    name: "Viewer",
                },
                {
                    key: AppTab.Graphs,
                    name: "Graphs",
                },
                {
                    key: AppTab.LoadSave,
                    name: "Load/save",
                },
                {
                    key: AppTab.Settings,
                    name: "Settings",
                }
            ]
        };
    },
    computed: {
        ...mapState(useRootStore, ["loadingApp", "failedToLoadData"])
    },
    async mounted() {
        await this.loadStateFromStorage();
    },
    methods: {
        ...mapActions(useRootStore, ["loadStateFromStorage"]),
        ...mapActions(useSettingsStore, ["setRemoteStorageMethod"]),

        refreshPage() {
            window.location.reload();
        },

        async switchToLoadingDataFromLocalStorage() {
            await this.setRemoteStorageMethod({
                remoteStorageMethod: "none",
                shouldTakeDataFrom: "local"
            });
            await this.loadStateFromStorage();
        }
    }
});
</script>
