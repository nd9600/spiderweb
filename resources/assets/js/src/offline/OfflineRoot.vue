<template>
    <div class="h-full">
        <OfflineApp class="w-full h-full" />
    </div>
</template>

<script>
import OfflineApp from "@/src/commonComponents/OfflineApp";
import {mapActions} from "pinia";
import {useRootStore} from "@/src/offline/store";

export default {
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
};
</script>
