<template>
    <div class="clicker">
        <button
            class="clicker__button"
            type="button"
            @click.prevent="toggleClickButtonMenu"
        >
            +
        </button>

        <div class="clicker__container">
            <label
                v-if="showClickButtonMenu"
                class="clicker__actionButtons"
            >
                <select
                    v-model="clickMode"
                    class="p-2 pr-3 select select--primary"
                >
                    <option value="openPosts">
                        Open posts
                    </option>
                    <option value="addLink">
                        Add link
                    </option>
                </select>
            </label>

            <div
                v-if="shouldShowContextMenu"
                class="clicker__contextMenu"
            >
                <template v-if="clickMode === 'addLink'">

                    <sub class="ml-1 text-xs text-gray-500">
                        {{ newLinkSource === null ? "click on a post to choose a source" : "will add link on next click" }}

                    </sub>
                    <sub class="ml-1 text-xs text-gray-500"></sub>
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
                        <button
                            class="btn btn--secondary"
                            type="button"
                            :disabled="newLinkSource == null"
                            @click="setNewLinkSource(null)"
                        >
                            x
                        </button>
                    </span>
                </template>
            </div>
        </div>
    </div>
</template>
<script>
import {mapState, mapGetters, mapMutations} from "vuex";

export default {
    name: "Clicker",

    computed: {
        ...mapState("postsModule", ["graphs", "selectedGraphIds"]),
        ...mapGetters("postsModule", ["titleOrBody"]),

        ...mapState("clickerModule", ["newLinkSource"]),

        showClickButtonMenu: {
            get() {
                return this.$store.state.clickerModule.showClickButtonMenu;
            },
            set(showClickButtonMenu) {
                this.setShowClickButtonMenu(showClickButtonMenu);
            }
        },
        clickMode: {
            get() {
                return this.$store.state.clickerModule.clickMode;
            },
            set(clickMode) {
                this.setClickMode(clickMode);
            }
        },
        newLinkGraphId: {
            get() {
                return this.$store.state.clickerModule.newLinkGraphId;
            },
            set(newLinkGraphId) {
                this.setNewLinkGraphId(newLinkGraphId);
            }
        },
        newLinkType: {
            get() {
                return this.$store.state.clickerModule.newLinkType;
            },
            set(newLinkType) {
                this.setNewLinkType(newLinkType);
            }
        },

        shouldShowContextMenu() {
            return this.clickMode === "addLink";
        }
    },
    created() {
        const initialGraphId = this.selectedGraphIds.length > 0
            ? this.selectedGraphIds[0]
            : 1;
        this.newLinkGraphId = initialGraphId;
    },
    methods: {
        ...mapMutations("clickerModule", [
            "setShowClickButtonMenu",
            "setClickMode",
            "setNewLinkSource",
            "setNewLinkTarget",
            "setNewLinkGraphId",
            "setNewLinkType",
        ]),

        toggleClickButtonMenu() {
            const menuWasPreviouslyShown = this.showClickButtonMenu;
            this.showClickButtonMenu = !this.showClickButtonMenu;

            if (!menuWasPreviouslyShown) {
                this.clickMode = "openPosts";
            }
        }
    }
};
</script>

<style scoped>
.clicker {
    position: absolute;
    bottom: 10%;
    right: 10%;
}
.clicker__button {
    border-radius: 9999px;

    background: var(--red);
    color: var(--white);
    cursor: pointer;

    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.clicker__container {
    position: absolute;
    bottom: 100%;
    right: 0;

    display: flex;
    flex-direction: column-reverse;
    align-items: flex-end;
}

.clicker__actionButtons {
    padding: 10px;
    margin-bottom: 10px;
}

.clicker__contextMenu {
    border-radius: 10px;
    padding: 0 10px 10px 10px;
    margin-bottom: 10px;

    background-color: white;
    border: 1px solid var(--red);
    color: #333;
}
</style>