<template>
    <div class="h-full flex flex-row">
        <sidebar
            class="w-1/3"
        />
        <offline-graph
            class="w-1/3"
        />
        <post-sidebar
            class="w-1/3"
        />
    </div>
</template>

<script>
import Sidebar from "@/js/commonComponents/Sidebar";
import OfflineGraph from "./OfflineGraph";
import PostSidebar from "@/js/commonComponents/PostSidebar";

import { mapState, mapGetters, mapActions } from "vuex";

export default {
    name: "Offline",
    components: {
        Sidebar,
        OfflineGraph,
        PostSidebar
    },
    mounted() {
        this.loadState();
    },
    methods: {
        ...mapActions(["loadState"]),
    }
};
</script>