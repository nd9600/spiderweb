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
            
            <h2 class="h h--2">
                <label>
                    Make new graph
                    <input 
                        v-model="newGraphName" 
                        type="text"
                        class="p-2 rounded text-gray-800 text-base placeholder-gray-600"
                        placeholder="foo graph"
                        @keyup.enter="makeNewGraphLocal"
                    />
                    <button
                        type="submit"
                        class="btn btn--primary"
                        :disabled="newGraphName.trim().length === 0"
                        @click="makeNewGraphLocal"
                    >
                        Create
                    </button>
                </label>
            </h2>
        </section>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
    name: "GraphSidebar",
    data() {
        return {
            newGraphName: ""
        };
    },
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
    },
    methods: {
        ...mapMutations("postsModule", ["makeNewGraph"]),
        makeNewGraphLocal() {
            this.makeNewGraph(this.newGraphName);
            this.newGraphName = "";
        }
    }
};
</script>
