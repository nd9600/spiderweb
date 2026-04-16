<template>
    <div class="h-full">
        <OfflineApp class="w-full h-full" />
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {mapActions} from "pinia";
import OfflineApp from "@/src/commonComponents/OfflineApp.vue";
import {useRootStore} from "@/src/offline/store";

export default defineComponent({
    name: "OfflineRoot",
    components: {
        OfflineApp,
    },
    async mounted() {
        await this.loadStateFromStorage();
    },
    methods: {
        ...mapActions(useRootStore, ["loadStateFromStorage"]),
    }
});
</script>
