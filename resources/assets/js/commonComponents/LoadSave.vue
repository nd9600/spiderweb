<template>
    <section>
        <button
            class="btn btn--primary"
            @click="loadState"
        >
            Load
        </button>
        
        <button
            class="btn btn--primary"
            @click="saveState"
        >
            Save
        </button>
    </section>
</template>

<script>
import { mapActions } from "vuex";

export default {
    name: "LoadSave",
    methods: {
        ...mapActions(["saveState", "loadState"]),
    }
};
</script>

<style scoped>

</style>
