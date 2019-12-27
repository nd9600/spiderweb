<template>
    <div class="flex flex-col">
    
        <section v-if="graphNames.length > 1"
            <h2 class="h h--2">
                Graphs
            </h2>
            <select
                v-model="selectedGraphName"
                class="mt-2 p-2 rounded text-gray-700"
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
    computed: {
        ...mapState("postsModule", ["posts", "selectedPostId"]),
        ...mapGetters("postsModule", ["graphNames"]),
        
        selectedGraphName: {
            get() {
                return this.$store.state.postsModule.selectedGraphName;
            },
            set(selectedGraphName) {
                this.$store.commit("postsModule/setSelectedGraphName", selectedGraphName);
            }
        },
    },
    components: {
        Post
    }
}
</script>
