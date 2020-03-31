<template>
    <div class="h-full">
        <OfflineApp class="w-full h-full" />
    </div>
</template>

<script>
import OfflineApp from "@/js/commonComponents/OfflineApp";

import { mapActions } from "vuex";

export default {
    name: "OfflineRoot",
    components: {
        OfflineApp,
    },
    async mounted() {
        await this.loadStateFromStorage();
    },
    methods: {
        ...mapActions(["loadStateFromStorage"]),
    }
};
</script>