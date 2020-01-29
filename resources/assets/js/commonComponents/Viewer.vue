<template>
    <div class="min-h-full flex flex-col">
        <offline-graph
            class="pb-4 w-full"
            style="min-height: 50vh"
        />
        <post-sidebar
            class="w-full"
            style="min-height: 50vh"
        />
    </div>
</template>

<script>
import OfflineGraph from "../offline/OfflineGraph";
import PostSidebar from "@/js/commonComponents/PostSidebar";

export default {
    name: "Viewer",
    components: {
        OfflineGraph,
        PostSidebar
    }
};
</script>

<style scoped>

</style>