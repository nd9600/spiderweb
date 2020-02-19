<template>
    <div class="py-2 pr-2 absolute greyBackground">
        <span>
            <button
                class="text-left underline"
                @click.prevent="showClickModeSelect = !showClickModeSelect"
            >
                click mode
            </button>

            <label>
                <select
                    v-if="showClickModeSelect"
                    v-model="clickMode"
                    class="p-2 rounded text-gray-700 bg-white"
                >
                    <option value="openPosts">
                        Open posts
                    </option>
                    <option value="addLink">
                        Add link
                    </option>
                </select>
            </label>
        </span>

        <div
            v-if="clickMode === 'addLink'"
            class="mt-1"
        >
            <label class="mb-1 block">
                Link in graph:
                <select
                    v-model.number="newLinkGraphId"
                    class="p-2 rounded text-gray-700 bg-white"
                >
                    <option
                        v-for="(graph, id) in graphs"
                        :key="id"
                        :value="id"
                    >
                        {{ graph.name }}
                    </option>
                </select>
            </label>

            <label class="mb-1 block">
                link type:
                <select
                    v-model="newLinkType"
                    class="p-2 rounded text-gray-700 bg-white"
                >
                    <option value="reply">
                        reply
                    </option>
                    <option value="sidenote">
                        sidenote
                    </option>
                    <option value="link">
                        link
                    </option>
                </select>
            </label>

            <span v-if="newLinkSource">
                Source: {{ titleOrBody(newLinkSource) }}
                <sub class="ml-1 text-xs text-gray-500">will add link on next click</sub>
                <button
                    class="btn btn--secondary"
                    type="button"
                    :disabled="newLinkSource == null"
                    @click="setNewLinkSource(null)"
                >
                    x
                </button>
            </span>
        </div>
    </div>
</template>
<script>
import {mapState, mapGetters, mapMutations} from "vuex";

export default {
    name: "ClickMode",

    data() {
        return {
            showClickModeSelect: false,
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs", "selectedGraphIds"]),
        ...mapGetters("postsModule", ["titleOrBody"]),

        ...mapState("clickModule", ["newLinkSource"]),

        clickMode: {
            get() {
                return this.$store.state.clickModule.clickMode;
            },
            set(clickMode) {
                this.setClickMode(clickMode);
            }
        },
        newLinkGraphId: {
            get() {
                return this.$store.state.clickModule.newLinkGraphId;
            },
            set(newLinkGraphId) {
                this.setNewLinkGraphId(newLinkGraphId);
            }
        },
        newLinkType: {
            get() {
                return this.$store.state.clickModule.newLinkType;
            },
            set(newLinkType) {
                this.setNewLinkType(newLinkType);
            }
        }
    },
    created() {
        const initialGraphId = this.selectedGraphIds.length === 1
            ? this.selectedGraphIds[0]
            : 1;
        this.newLinkGraphId = initialGraphId;
    },
    methods: {
        ...mapMutations("clickModule", [
            "setClickMode",
            "setNewLinkSource",
            "setNewLinkTarget",
            "setNewLinkGraphId",
            "setNewLinkType",
        ]),
    }
};
</script>

<style scoped>
.greyBackground {
    background-color: #eeeeee;
}
</style>