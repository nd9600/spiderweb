<template>
    <div class="mb-4">
        <button
            v-if="!showClickModeSelect"
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
        <div v-if="clickMode === 'addLink'">
            <label class="block">
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

            <label class="block">
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

            todo: display current source & target, let you reset everything
        </div>
    </div>
</template>
<script>
import {mapState, mapMutations} from "vuex";

export default {
    name: "ClickMode",

    data() {
        return {
            showClickModeSelect: false,
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs", "selectedGraphIds"]),

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
            "setNewLinkGraphId",
            "setNewLinkType",
        ]),
    }
};
</script>
