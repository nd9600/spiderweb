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
                class="text-gray-600"
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
        }
    },
    methods: {
        ...mapMutations("settingsModule", ["setShouldAutosave", "setCanOpenMultiplePosts"])
    }
};
</script>

<style scoped>
.setting {
    display: flex;
    justify-content: space-between;

    padding: 1rem 2rem;

    background-color: white;
    border-radius: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.setting:not(:last-of-type) {
    margin-bottom: 2rem;
}
</style>