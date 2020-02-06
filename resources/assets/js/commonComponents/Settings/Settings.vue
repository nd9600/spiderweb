<template>
    <section>
        <label>
            Should autosave
            <input
                v-model="shouldAutosave"
                type="checkbox"
            />
            <sub
                v-if="!shouldAutosave"
                class="text-gray-600"
            >
                (you'll need to press "save" in the "load/save" tab)
            </sub>
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
        }
    },
    methods: {
        ...mapMutations("settingsModule", ["setShouldAutosave"])
    }
};
</script>