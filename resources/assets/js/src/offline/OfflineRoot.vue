<template>
    <div class="h-full">
        <OfflineApp class="w-full h-full" />
    </div>
</template>

<script>
import OfflineApp from "@/src/commonComponents/OfflineApp.vue";
import { useAppStore } from "@/src/stores";

export default {
    name: "OfflineRoot",
    components: {
        OfflineApp,
    },
    computed: {
        appStore() {
            return useAppStore();
        }
    },
    methods: {
    },
    async mounted() {
        await this.appStore.loadStateFromStorage();
    }
};
</script>