import type {ActionContext, ActionTree, GetterTree, Module, MutationTree} from "vuex";

import {
    ClickerModuleState,
    ClickMode,
    LinkId,
    LinkType,
    PostId,
    RootStoreState,
    SubgraphId
} from "@/src/@types/StoreTypes";

interface ClickedPost {
    id: PostId;
}

interface ClickedLinkEndpoint {
    id: PostId;
    x: number;
    y: number;
}

interface ClickedLink {
    id: LinkId;
    source: ClickedLinkEndpoint;
    target: ClickedLinkEndpoint;
}

interface LinkClickPayload {
    link: ClickedLink;
    coordinates: [number, number];
}

type ClickerActionContext = ActionContext<ClickerModuleState, RootStoreState>;

const state: ClickerModuleState = {
    shouldShowClickButtonMenu: false,
    clickMode: "openPosts",
    newLinkSource: null,
    newLinkTarget: null,
    newLinkType: "reply",
    newLinkSubgraphIds: [],
    linkToEdit: null,
    wantsToChangeSource: false,
    wantsToChangeTarget: false,
};

const getters: GetterTree<ClickerModuleState, RootStoreState> = {
};

const mutations: MutationTree<ClickerModuleState> = {
    setShouldShowClickButtonMenu(state, shouldShowClickButtonMenu: boolean) {
        state.shouldShowClickButtonMenu = shouldShowClickButtonMenu;
        if (!shouldShowClickButtonMenu) {
            state.newLinkSource = null;
            state.newLinkTarget = null;
            state.newLinkType = "reply";
            state.newLinkSubgraphIds = [];

            state.linkToEdit = null;
            state.wantsToChangeSource = false;
            state.wantsToChangeTarget = false;
        }
    },

    setClickMode(state, clickMode: ClickMode) {
        state.clickMode = clickMode;
    },
    setNewLinkSource(state, newLinkSource: Nullable<PostId>) {
        state.newLinkSource = newLinkSource;
    },
    setNewLinkTarget(state, newLinkTarget: Nullable<PostId>) {
        state.newLinkTarget = newLinkTarget;
    },
    setNewLinkType(state, newLinkType: LinkType) {
        state.newLinkType = newLinkType;
    },
    setNewLinkSubgraphIds(state, newLinkSubgraphIds: SubgraphId[]) {
        state.newLinkSubgraphIds = newLinkSubgraphIds;
    },

    setLinkToEdit(state, linkToEdit: Nullable<LinkId>) {
        state.linkToEdit = linkToEdit;
    },
    setWantsToChangeSource(state, wantsToChangeSource: boolean) {
        state.wantsToChangeSource = wantsToChangeSource;
    },
    setWantsToChangeTarget(state, wantsToChangeTarget: boolean) {
        state.wantsToChangeTarget = wantsToChangeTarget;
    },
};

const actions: ActionTree<ClickerModuleState, RootStoreState> = {
    async handlePostClick(context: ClickerActionContext, post: ClickedPost | unknown) {
        if (typeof post !== "object" || post === null || !("id" in post)) {
            console.error("no post clicked, clicked", post);
            return;
        }

        switch (context.state.clickMode) {
            case "openPosts":
            default: {
                context.commit(
                    "dataModule/selectPostId",
                    {
                        id: post.id,
                        canOpenMultiplePosts: context.rootState.settingsModule.canOpenMultiplePosts
                    },
                    {
                        root: true
                    }
                );
                break;
            }

            case "addLink": {
                // first we set the source, then we set the target & add the link
                if (context.state.newLinkSource === null) {
                    context.commit("setNewLinkSource", post.id);
                    break;
                } else {
                    if (context.state.newLinkSource === post.id) {
                        return;
                    }

                    context.commit("setNewLinkTarget", post.id);

                    context.commit(
                        "dataModule/addLink",
                        {
                            source: context.state.newLinkSource,
                            target: post.id,
                            graph: context.rootState.dataModule.selectedGraphId,
                            type: context.state.newLinkType,
                            subgraphIds: context.state.newLinkSubgraphIds
                        },
                        {
                            root: true
                        }
                    );

                    context.commit("setClickMode", "openPosts");
                    context.commit("setNewLinkSource", null);
                    context.commit("setNewLinkTarget", null);
                    context.commit("setNewLinkSubgraphIds", []);

                    break;
                }
            }

            case "changeLink": {
                if (context.state.wantsToChangeSource) {
                    context.commit(
                        "dataModule/changeLinkSource",
                        {
                            id: context.state.linkToEdit,
                            source: post.id
                        },
                        {
                            root: true
                        }
                    );
                    context.commit("setWantsToChangeSource", false);

                } else if (context.state.wantsToChangeTarget) {
                    context.commit(
                        "dataModule/changeLinkTarget",
                        {
                            id: context.state.linkToEdit,
                            target: post.id
                        },
                        {
                            root: true
                        }
                    );
                    context.commit("setWantsToChangeTarget", false);
                }
                context.commit("setClickMode", "openPosts");
                context.commit("setLinkToEdit", null);
            }
        }
    },

    async handleLinkClick(context: ClickerActionContext, {link, coordinates}: LinkClickPayload) {
        if (typeof link !== "object") {
            console.error("no link clicked, clicked", link);
            return;
        }

        switch (context.state.clickMode) {
            case "openPosts": {
                const sourceCoordinates: [number, number] = [link.source.x, link.source.y];
                const targetCoordinates: [number, number] = [link.target.x, link.target.y];

                const distanceBetweenClickAndSource = Math.hypot(
                    sourceCoordinates[0] - coordinates[0],
                    sourceCoordinates[1] - coordinates[1]
                );
                const distanceBetweenClickAndTarget = Math.hypot(
                    targetCoordinates[0] - coordinates[0],
                    targetCoordinates[1] - coordinates[1]
                );

                if (distanceBetweenClickAndSource < distanceBetweenClickAndTarget) {
                    return link.target.id;
                } else if (distanceBetweenClickAndTarget < distanceBetweenClickAndSource) {
                    return link.source.id;
                } else {
                    return;
                }
            }
            case "changeLink": {
                context.commit("setLinkToEdit", link.id);
                break;
            }
            default: {
                return;
            }
        }

        return;
    }
};

const clickerModule: Module<ClickerModuleState, RootStoreState> = {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};

export default clickerModule;
