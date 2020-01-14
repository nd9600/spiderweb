<template>
    <div class="flex flex-col">
        <section v-if="graphNames.length > 1">
            <h1 class="h h--1">
                Graphs
            </h1>
            <label>
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
            </label>
        </section>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "GraphSidebar",
    components: {    },
    computed: {
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
