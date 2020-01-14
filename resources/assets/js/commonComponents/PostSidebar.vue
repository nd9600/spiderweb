<template>
    <div class="p-4 h-full flex overflow-x-auto postSidebar">
        <post
            v-if="selectedPostId !== null"
            class="min-w-full"
            :post="posts[selectedPostId]"
        >
        </post>
    </div>
</template>

<script>
import Post from "@/js/commonComponents/Post";

import { mapState, mapGetters } from "vuex";


export default {
    name: "PostSidebar",
    components: {
        Post
    },
    computed: {
        ...mapState("postsModule", ["posts", "selectedPostId"]),
        ...mapGetters("postsModule", ["graphNames"]),
        
        selectedGraphNames: {
            get() {
                return this.$store.state.postsModule.selectedGraphNames;
            },
            set(selectedGraphNames) {
                this.$store.commit("postsModule/setSelectedGraphNames", selectedGraphNames);
            }
        },
    }
};
</script>

<style>
    .postSidebar {
        min-width: 33%;
    }
</style>