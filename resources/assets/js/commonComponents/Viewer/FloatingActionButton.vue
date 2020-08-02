<template>
    <div class="clicker">
        <button
            class="clicker__button"
            type="button"
            @click.prevent="toggleClickButtonMenu"
        >
            +
        </button>

        <div
            :style="{
                'max-height': graphHeight + 'vh'
            }"
            class="clicker__container text-xs md:text-base"
        >
            <div
                v-if="shouldShowClickButtonMenu"
                class="clicker__actionButtons"
            >
                <button
                    class="clicker__actionButton"
                    type="button"
                    @click.prevent="toggleClickMode('attachPostsToGraphs')"
                >
                    <span class="linkIcon"></span> Attach posts to graphs
                </button>

                <button
                    class="clicker__actionButton"
                    type="button"
                    @click.prevent="toggleClickMode('changeLink')"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 14 16"
                        class="mr-2 opacity-50"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M0 12v3h3l8-8-3-3-8 8zm3 2H1v-2h1v1h1v1zm10.3-9.3L12 6 9 3l1.3-1.3a.996.996 0 011.41 0l1.59 1.59c.39.39.39 1.02 0 1.41z"
                        >
                        </path>
                    </svg>
                    Change/remove link
                </button>

                <button
                    class="clicker__actionButton"
                    type="button"
                    @click.prevent="toggleClickMode('addLink')"
                >
                    <span class="mr-2 text-xl text-red">↔</span> Add link between posts
                </button>

                <button
                    class="clicker__actionButton"
                    type="button"
                    @click.prevent="toggleClickMode('addPost')"
                >
                    <span class="mr-2 text-xl font-bold text-red">+</span> Add post
                </button>

                <button
                    class="clicker__actionButton"
                    type="button"
                    @click.prevent="toggleClickMode('searchForPosts')"
                >
                    <span class="mr-2 text-xl font-bold text-red">&#128269;</span> Search for posts
                </button>
            </div>

            <div
                v-if="shouldShowContextMenu"
                class="clicker__contextMenu"
            >
                <LinkAdder v-if="clickMode === 'addLink'"/>
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
                        @removedLink="onRemovedLink"
                    />
                </template>
                <PostMaker
                    v-else-if="clickMode === 'addPost'"
                    @madePost="madePost"
                />
                <PostsAttacher v-else-if="clickMode === 'attachPostsToGraphs'" />
                <PostSearch
                    v-else-if="clickMode === 'searchForPosts'"
                    @clickedOnResult="selectPost($event)"
                />
            </div>
        </div>
    </div>
</template>
<script>
import {mapState, mapGetters, mapMutations} from "vuex";

import LinkEditor from "@/js/commonComponents/Links/LinkEditor";
import LinkAdder from "@/js/commonComponents/Links/LinkAdder";
import PostMaker from "@/js/commonComponents/Posts/PostMaker";
import PostsAttacher from "@/js/commonComponents/Posts/PostsAttacher";
import PostSearch from "@/js/commonComponents/Posts/PostSearch";

export default {
    name: "FloatingActionButton",
    components: {
        LinkEditor,
        LinkAdder,
        PostMaker,
        PostsAttacher,
        PostSearch
    },
    computed: {
        ...mapState("settingsModule", ["graphHeight", "canOpenMultiplePosts"]),

        ...mapState("dataModule", ["graphs", "selectedSubgraphIds", "links"]),
        ...mapGetters("dataModule", ["titleOrBody"]),

        ...mapState("clickerModule", ["newLinkSource", "linkToEdit"]),

        shouldShowClickButtonMenu: {
            get() {
                return this.$store.state.clickerModule.shouldShowClickButtonMenu;
            },
            set(shouldShowClickButtonMenu) {
                this.setShouldShowClickButtonMenu(shouldShowClickButtonMenu);
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
        const initialGraphId = this.selectedSubgraphIds.length > 0
            ? this.selectedSubgraphIds[0]
            : 1;
        this.newLinkGraphId = initialGraphId;
    },
    methods: {
        ...mapMutations("clickerModule", [
            "setShouldShowClickButtonMenu",
            "setClickMode",
            "setLinkToEdit"
        ]),
        ...mapMutations("dataModule", [
            "selectPostId",
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
        },

        selectPost(post) {
            this.selectPostId({
                id: post.id,
                canOpenMultiplePosts: this.canOpenMultiplePosts
            });
        },

        onRemovedLink() {
            this.setLinkToEdit(null);
            this.clickMode = "openPosts";
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
    max-width: 50vw;
}

.clicker__actionButtons {
    padding: 10px;
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
    margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
    .clicker__actionButton {
        border: 0;
        border-radius: 0;
        padding: 0.25rem;
    }

    .clicker__actionButton:not(:last-of-type) {
        margin-bottom: 0.25rem;
    }
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
    padding: 5px;
    max-width: 100%;

    background-color: white;
    border: 1px solid var(--red);
    color: #333;
    overflow-y: auto;
}
</style>