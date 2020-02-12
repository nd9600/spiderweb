<template>
    <div class="h-full">
        <navbar class="w-full h-full"/>
    </div>
</template>

<script>
import Navbar from "@/js/commonComponents/Navbar";


import { mapActions } from "vuex";

export default {
    name: "Offline",
    components: {
        Navbar
    },
    mounted() {
        this.loadStateFromStorage();
    },
    methods: {
        ...mapActions(["loadStateFromStorage"]),
    }
};
</script>