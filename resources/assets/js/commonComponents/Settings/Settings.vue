<template>
    <section class="flex flex-col items-start">
        <label class="setting">
            Should autosave
            <input
                v-model="shouldAutosave"
                class="ml-4"
                type="checkbox"
            />
            <sub
                v-if="!shouldAutosave"
                class="text-gray-500"
            >
                (you'll need to press "save" in the "load/save" tab)
            </sub>
        </label>

        <label class="setting">
            Can open multiple posts in the viewer
            <input
                v-model="canOpenMultiplePosts"
                class="ml-4"
                type="checkbox"
            />
        </label>

        <label class="setting">
            Graph height
            <input
                v-model.number="graphHeight"
                class="ml-4 mb-2 p-2 rounded text-gray-800 text-base bg-gray-400"
                type="number"
                inputmode="numeric"
                pattern="^[1-9][0-9]?$|^100$"
                size="3"
                minlength="1"
                maxlength="3"
                min="1"
                max="100"
                step="1"
            />
            <sub class="ml-1 text-xs text-gray-500">vh</sub>
        </label>

        <label class="setting">
            Post-bar height
            <input
                v-model.number="postBarHeight"
                class="ml-4 mb-2 p-2 rounded text-gray-800 text-base bg-gray-400"
                type="number"
                inputmode="numeric"
                pattern="^[1-9][0-9]?$|^100$"
                size="3"
                minlength="1"
                maxlength="3"
                min="1"
                max="100"
                step="1"
            />
            <sub class="ml-1 text-xs text-gray-500">vh</sub>
        </label>
    </section>
</template>

<script>
import {mapMutations} from "vuex";

export default {
    name: "Settings",
    computed: {
        shouldAutosave: {
            get() {
                return this.$store.state.settingsModule.shouldAutosave;
            },
            set(shouldAutosave) {
                this.setShouldAutosave(shouldAutosave);
            }
        },
        canOpenMultiplePosts: {
            get() {
                return this.$store.state.settingsModule.canOpenMultiplePosts;
            },
            set(canOpenMultiplePosts) {
                this.setCanOpenMultiplePosts(canOpenMultiplePosts);
            }
        },

        graphHeight: {
            get() {
                return this.$store.state.settingsModule.graphHeight;
            },
            set(graphHeight) {
                this.setGraphHeight(graphHeight);
            }
        },
        postBarHeight: {
            get() {
                return this.$store.state.settingsModule.postBarHeight;
            },
            set(postBarHeight) {
                this.setPostBarHeight(postBarHeight);
            }
        }
    },
    methods: {
        ...mapMutations("settingsModule", ["setShouldAutosave", "setCanOpenMultiplePosts", "setGraphHeight", "setPostBarHeight"])
    }
};
</script>

<style scoped>
.setting {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 1rem 2rem;

    background-color: white;
    border-radius: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.setting:not(:last-of-type) {
    margin-bottom: 2rem;
}
</style>