<template>
    <div class="clicker">
        <button
            class="clicker__button"
            type="button"
            @click.prevent="toggleClickButtonMenu"
        >
            +
        </button>

        <div class="clicker__container text-xs md:text-base">
            <div
                v-if="shouldShowClickButtonMenu"
                class="clicker__actionButtons"
            >
                <button
                    class="clicker__actionButton"
                    type="button"
                    @click.prevent="toggleClickMode('addLink')"
                >
                    Add link between <span class="mx-2 text-red">↔</span> posts
                </button>

                <button
                    class="clicker__actionButton"
                    type="button"
                    @click.prevent="toggleClickMode('changeLink')"
                >
                    ✎ &#x1f5d1; Change/remove link
                </button>

                <button
                    class="clicker__actionButton"
                    type="button"
                    @click.prevent="toggleClickMode('addPost')"
                >
                    <span class="mr-2 text-lg font-bold text-red">+</span> Add post
                </button>

                <button
                    class="clicker__actionButton"
                    type="button"
                    @click.prevent="toggleClickMode('attachPostsToGraphs')"
                >
                    <span class="linkIcon"></span> Attach posts to graphs
                </button>
            </div>

            <div
                v-if="shouldShowContextMenu"
                class="clicker__contextMenu"
            >
                <template v-if="clickMode === 'addLink'">
                    <label class="mb-4">
                        The new link will be a
                        <select
                            v-model="newLinkType"
                            class="select select--secondary mb-2"
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
                        in the graph
                        <select
                            v-model.number="newLinkGraphId"
                            class="select select--secondary max-w-full"
                        >
                            <option
                                v-for="(graph, id) in graphs"
                                :key="id"
                                :value="id"
                                class="truncate"
                            >
                                {{ graph.name }}
                            </option>
                        </select>
                    </label>

                    <label
                        v-if="newLinkSource"
                        class="mt-4 pt-4 block"
                        style="border-top: 1px solid var(--red)"
                    >
                        It'll be from
                        <span class="inline-block">
                            <span class="text-red">{{ titleOrBody(newLinkSource) }}</span>
                            →
                            <span class="text-red">[the next post you click on]</span>
                        </span>
                    </label>

                    <sub class="my-2 text-xs text-gray-500">
                        {{ newLinkSource === null ? "click on a post to choose a source for the link" : "the link will be created when you click on another post" }}

                    </sub>

                    <button
                        v-if="newLinkSource !== null"
                        class="btn btn--secondary"
                        type="button"
                        :disabled="newLinkSource == null"
                        title="remove this source"
                        @click="setNewLinkSource(null)"
                    >
                        x
                    </button>
                </template>
                <template v-else-if="clickMode === 'changeLink'">
                    <sub
                        v-if="linkToEdit === null"
                        class="text-xs text-gray-500"
                    >
                        click on a link to change it
                    </sub>
                    <LinkEditor
                        v-else
                        :link="links[linkToEdit]"
                        @removedLink="linkToEdit = null"
                    />
                </template>
                <PostMaker
                    v-else-if="clickMode === 'addPost'"
                    @madePost="madePost"
                />
                <PostAttacher v-else-if="clickMode === 'attachPostsToGraphs'" />
            </div>
        </div>
    </div>
</template>
<script>
import {mapState, mapGetters, mapMutations} from "vuex";

import LinkEditor from "@/js/commonComponents/Links/LinkEditor";
import PostMaker from "@/js/commonComponents/Posts/PostMaker";
import PostAttacher from "@/js/commonComponents/Posts/PostAttacher";

export default {
    name: "FloatingActionButton",
    components: {
        LinkEditor,
        PostMaker,
        PostAttacher
    },
    computed: {
        ...mapState("postsModule", ["graphs", "selectedGraphIds", "links"]),
        ...mapGetters("postsModule", ["titleOrBody"]),

        ...mapState("clickerModule", ["newLinkSource", "linkToEdit"]),

        shouldShowClickButtonMenu: {
            get() {
                return this.$store.state.clickerModule.shouldShowClickButtonMenu;
            },
            set(shouldShowClickButtonMenu) {
                this.setshouldShowClickButtonMenu(shouldShowClickButtonMenu);
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
            return this.clickMode !== "openPosts";
        }
    },
    watch: {
        clickMode(newClickMode, previousClickMode) {
            if (newClickMode === "changeLink") {
                document.querySelector(":root")
                    .style.setProperty("--link-stroke-width", "40px");
            } else if (previousClickMode === "changeLink") {
                document.querySelector(":root")
                    .style.setProperty("--link-stroke-width", "20px");
            }
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
            "setshouldShowClickButtonMenu",
            "setClickMode",
            "setNewLinkSource",
            "setNewLinkTarget",
            "setNewLinkGraphId",
            "setNewLinkType",
        ]),

        toggleClickButtonMenu() {
            const menuWasPreviouslyShown = this.shouldShowClickButtonMenu;
            this.shouldShowClickButtonMenu = !this.shouldShowClickButtonMenu;

            if (!menuWasPreviouslyShown) {
                this.clickMode = "openPosts";
            }
        },

        toggleClickMode(clickMode) {
            const previousClickMode = this.clickMode;
            this.clickMode = (previousClickMode === clickMode) // clicking on the existing button means you want to close the open dialog
                ? "openPosts"
                : clickMode;
        },

        madePost() {
            this.toggleClickMode("openPosts");
            this.shouldShowClickButtonMenu = false;
        }
    }
};
</script>

<style scoped>
.clicker {
    position: absolute;
    bottom: 5%;
    right: 0;
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

    background-color: #f7f7f7e6;
    border-radius: 10px;
    max-width: 85vw;
}

.clicker__actionButtons {
    padding: 10px;
    margin-bottom: 10px;
    max-width: 100%;
}
.clicker__actionButton {
    display: flex;
    align-items: center;

    border: 1px solid var(--red);
    padding: 0.5rem 0.75rem;
    border-radius: 2rem;
    white-space: nowrap;
    transition: all 0.3s ease;
}
.clicker__actionButton:hover,
.clicker__actionButton:focus,
.clicker__actionButton:active {
    background-color: #e8e8e8;
}
.clicker__actionButton:not(:last-of-type) {
    margin-bottom: 1rem;
}

.linkIcon {
    display: inline-block;
    width: 28px;
    height: 20px;

    background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTEuNDgyIDYuNTE3MThDMTMuNTgyNSA4LjYxOTg0IDEzLjU1MzYgMTEuOTkwOSAxMS40OTQ2IDE0LjA2MTRDMTEuNDkwOCAxNC4wNjU2IDExLjQ4NjIgMTQuMDcwMiAxMS40ODIgMTQuMDc0NEw5LjExOTQ4IDE2LjQzNjlDNy4wMzU3NyAxOC41MjA2IDMuNjQ1NjkgMTguNTIwMyAxLjU2MjMgMTYuNDM2OUMtMC41MjE0MTYgMTQuMzUzNSAtMC41MjE0MTYgMTAuOTYzIDEuNTYyMyA4Ljg3OTY4TDIuODY2OCA3LjU3NTE4QzMuMjEyNzQgNy4yMjkyNCAzLjgwODUgNy40NTkxNiAzLjgyNjM2IDcuOTQ4MDRDMy44NDkxNCA4LjU3MTA4IDMuOTYwODcgOS4xOTcwNCA0LjE2NzAyIDkuODAxNTJDNC4yMzY4NCAxMC4wMDYyIDQuMTg2OTYgMTAuMjMyNiA0LjAzNDAzIDEwLjM4NTVMMy41NzM5NCAxMC44NDU2QzIuNTg4NjUgMTEuODMwOSAyLjU1Nzc0IDEzLjQzNTIgMy41MzMzMyAxNC40MzAyQzQuNTE4NTUgMTUuNDM0OSA2LjEzNzkyIDE1LjQ0MDkgNy4xMzA2OSAxNC40NDgxTDkuNDkzMTkgMTIuMDg1OUMxMC40ODQzIDExLjA5NDggMTAuNDgwMSA5LjQ5MjkyIDkuNDkzMTkgOC41MDU5N0M5LjM2MzA4IDguMzc2MTEgOS4yMzIwMiA4LjI3NTIxIDkuMTI5NjQgOC4yMDQ3MkM5LjA1NzIyIDguMTU0OTkgOC45OTc0MiA4LjA4OTAxIDguOTU1MDIgOC4wMTIwN0M4LjkxMjYxIDcuOTM1MTIgOC44ODg3OCA3Ljg0OTMzIDguODg1NDEgNy43NjE1NEM4Ljg3MTQ5IDcuMzkwMDQgOS4wMDMxMiA3LjAwNzIzIDkuMjk2NjcgNi43MTM2N0wxMC4wMzY5IDUuOTczNDZDMTAuMjMwOSA1Ljc3OTM2IDEwLjUzNTQgNS43NTU1MiAxMC43NjA1IDUuOTEyNkMxMS4wMTgzIDYuMDkyNTggMTEuMjU5NyA2LjI5NDg5IDExLjQ4MiA2LjUxNzE4VjYuNTE3MThaTTE2LjQzNjcgMS41NjIxOUMxNC4zNTMzIC0wLjUyMTI0IDEwLjk2MzMgLTAuNTIxNTIyIDguODc5NTQgMS41NjIxOUw2LjUxNzA0IDMuOTI0NjlDNi41MTI4MiAzLjkyODkxIDYuNTA4MjUgMy45MzM0OCA2LjUwNDM5IDMuOTM3N0M0LjQ0NTQyIDYuMDA4MTIgNC40MTY1NiA5LjM3OTIyIDYuNTE3MDQgMTEuNDgxOUM2LjczOTMzIDExLjcwNDIgNi45ODA3NCAxMS45MDY1IDcuMjM4NDggMTIuMDg2NEM3LjQ2MzU1IDEyLjI0MzUgNy43NjgwOCAxMi4yMTk2IDcuOTYyMTQgMTIuMDI1Nkw4LjcwMjMyIDExLjI4NTRDOC45OTU4OCAxMC45OTE4IDkuMTI3NSAxMC42MDkgOS4xMTM1OCAxMC4yMzc1QzkuMTEwMjEgMTAuMTQ5NyA5LjA4NjM4IDEwLjA2MzkgOS4wNDM5OCA5Ljk4Njk2QzkuMDAxNTcgOS45MTAwMSA4Ljk0MTc3IDkuODQ0MDQgOC44NjkzNSA5Ljc5NDMxQzguNzY2OTcgOS43MjM4MiA4LjYzNTkxIDkuNjIyOTIgOC41MDU4IDkuNDkzMDZDNy41MTg4NiA4LjUwNjExIDcuNTE0NzEgNi45MDQxOCA4LjUwNTggNS45MTMwOUwxMC44NjgzIDMuNTUwOTRDMTEuODYxMSAyLjU1ODE3IDEzLjQ4MDQgMi41NjQxNCAxNC40NjU3IDMuNTY4ODdDMTUuNDQxMiA0LjU2MzggMTUuNDEwNCA2LjE2ODEyIDE0LjQyNTEgNy4xNTM0MUwxMy45NjUgNy42MTM1QzEzLjgxMiA3Ljc2NjQzIDEzLjc2MjEgNy45OTI4MyAxMy44MzIgOC4xOTc1MUMxNC4wMzgxIDguODAxOTkgMTQuMTQ5OSA5LjQyNzk1IDE0LjE3MjYgMTAuMDUxQzE0LjE5MDUgMTAuNTM5OSAxNC43ODYzIDEwLjc2OTggMTUuMTMyMiAxMC40MjM5TDE2LjQzNjcgOS4xMTkzNEMxOC41MjA0IDcuMDM2MDIgMTguNTIwNCAzLjY0NTU1IDE2LjQzNjcgMS41NjIxOVYxLjU2MjE5WiIgZmlsbD0iY3VycmVudENvbG9yIiBmaWxsLW9wYWNpdHk9IjAuMjUiLz48L3N2Zz4=") no-repeat left;
    background-size: contain;
}

.clicker__contextMenu {
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 10px;
    max-width: 100%;

    background-color: white;
    border: 1px solid var(--red);
    color: #333;
}
</style>