<template>
    <div class="flex flex-col">
        <section v-if="graphNames.length > 1">
            <h2 class="h h--2">
                Graphs
            </h2>
            <select
                v-model="selectedGraphNames"
                class="mt-2 p-2 rounded text-gray-700"
                multiple
            >
                <option
                    v-for="graphName in graphNames"
                    :key="graphName"
                    :value="graphName"
                >
                    {{ graphName }}
                </option>
            </select>
        </section>
    
        <post
            v-if="selectedPostId !== null"
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
}
</script>
