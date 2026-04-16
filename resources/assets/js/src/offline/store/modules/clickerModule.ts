import {defineStore} from "pinia";

import {
    ClickerModuleState,
    ClickMode,
    LinkId,
    LinkType,
    PostId,
    SubgraphId
} from "@/src/@types/StoreTypes";
import {useDataStore} from "./dataModule";
import {useSettingsStore} from "./settingsModule";

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

interface ClickerStoreApi extends ClickerModuleState {
    setNewLinkSource(newLinkSource: Nullable<PostId>): void;
    setNewLinkTarget(newLinkTarget: Nullable<PostId>): void;
    setNewLinkSubgraphIds(newLinkSubgraphIds: SubgraphId[]): void;
    setClickMode(clickMode: ClickMode): void;
    setLinkToEdit(linkToEdit: Nullable<LinkId>): void;
    setWantsToChangeSource(wantsToChangeSource: boolean): void;
    setWantsToChangeTarget(wantsToChangeTarget: boolean): void;
}

function isClickedPost(post: unknown): post is ClickedPost {
    return typeof post === "object"
        && post !== null
        && "id" in post
        && typeof post.id === "string";
}

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

const mutations = {
    setShouldShowClickButtonMenu(state: ClickerModuleState, shouldShowClickButtonMenu: boolean) {
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

    setClickMode(state: ClickerModuleState, clickMode: ClickMode) {
        state.clickMode = clickMode;
    },
    setNewLinkSource(state: ClickerModuleState, newLinkSource: Nullable<PostId>) {
        state.newLinkSource = newLinkSource;
    },
    setNewLinkTarget(state: ClickerModuleState, newLinkTarget: Nullable<PostId>) {
        state.newLinkTarget = newLinkTarget;
    },
    setNewLinkType(state: ClickerModuleState, newLinkType: LinkType) {
        state.newLinkType = newLinkType;
    },
    setNewLinkSubgraphIds(state: ClickerModuleState, newLinkSubgraphIds: SubgraphId[]) {
        state.newLinkSubgraphIds = newLinkSubgraphIds;
    },

    setLinkToEdit(state: ClickerModuleState, linkToEdit: Nullable<LinkId>) {
        state.linkToEdit = linkToEdit;
    },
    setWantsToChangeSource(state: ClickerModuleState, wantsToChangeSource: boolean) {
        state.wantsToChangeSource = wantsToChangeSource;
    },
    setWantsToChangeTarget(state: ClickerModuleState, wantsToChangeTarget: boolean) {
        state.wantsToChangeTarget = wantsToChangeTarget;
    },
};

const actions = {
    async handlePostClick(store: ClickerStoreApi, post: unknown) {
        if (!isClickedPost(post)) {
            console.error("no post clicked, clicked", post);
            return;
        }

        const dataStore = useDataStore();
        const settingsStore = useSettingsStore();

        switch (store.clickMode) {
            case "openPosts":
            default: {
                dataStore.selectPostId({
                    id: post.id,
                    canOpenMultiplePosts: settingsStore.canOpenMultiplePosts
                });
                break;
            }

            case "addLink": {
                if (store.newLinkSource === null) {
                    store.setNewLinkSource(post.id);
                    break;
                } else {
                    const newLinkSource = store.newLinkSource;
                    if (newLinkSource == null || newLinkSource === post.id) {
                        return;
                    }

                    store.setNewLinkTarget(post.id);

                    dataStore.addLink({
                        source: newLinkSource,
                        target: post.id,
                        graph: dataStore.selectedGraphId!,
                        type: store.newLinkType,
                        subgraphIds: store.newLinkSubgraphIds
                    });

                    store.setClickMode("openPosts");
                    store.setNewLinkSource(null);
                    store.setNewLinkTarget(null);
                    store.setNewLinkSubgraphIds([]);

                    break;
                }
            }

            case "changeLink": {
                if (store.wantsToChangeSource) {
                    if (store.linkToEdit == null) {
                        return;
                    }
                    dataStore.changeLinkSource({
                        id: store.linkToEdit,
                        source: post.id
                    });
                    store.setWantsToChangeSource(false);
                } else if (store.wantsToChangeTarget) {
                    if (store.linkToEdit == null) {
                        return;
                    }
                    dataStore.changeLinkTarget({
                        id: store.linkToEdit,
                        target: post.id
                    });
                    store.setWantsToChangeTarget(false);
                }
                store.setClickMode("openPosts");
                store.setLinkToEdit(null);
            }
        }
    },

    async handleLinkClick(store: ClickerStoreApi, {link, coordinates}: LinkClickPayload) {
        if (typeof link !== "object") {
            console.error("no link clicked, clicked", link);
            return;
        }

        switch (store.clickMode) {
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
                store.setLinkToEdit(link.id);
                break;
            }
            default: {
                return;
            }
        }

        return;
    }
};

export const useClickerStore = defineStore("clickerModule", {
    state: (): ClickerModuleState => ({
        ...state
    }),
    actions: {
        setShouldShowClickButtonMenu(shouldShowClickButtonMenu: boolean) {
            mutations.setShouldShowClickButtonMenu(this, shouldShowClickButtonMenu);
        },
        setClickMode(clickMode: ClickMode) {
            mutations.setClickMode(this, clickMode);
        },
        setNewLinkSource(newLinkSource: Nullable<PostId>) {
            mutations.setNewLinkSource(this, newLinkSource);
        },
        setNewLinkTarget(newLinkTarget: Nullable<PostId>) {
            mutations.setNewLinkTarget(this, newLinkTarget);
        },
        setNewLinkType(newLinkType: LinkType) {
            mutations.setNewLinkType(this, newLinkType);
        },
        setNewLinkSubgraphIds(newLinkSubgraphIds: SubgraphId[]) {
            mutations.setNewLinkSubgraphIds(this, newLinkSubgraphIds);
        },
        setLinkToEdit(linkToEdit: Nullable<LinkId>) {
            mutations.setLinkToEdit(this, linkToEdit);
        },
        setWantsToChangeSource(wantsToChangeSource: boolean) {
            mutations.setWantsToChangeSource(this, wantsToChangeSource);
        },
        setWantsToChangeTarget(wantsToChangeTarget: boolean) {
            mutations.setWantsToChangeTarget(this, wantsToChangeTarget);
        },
        async handlePostClick(post: ClickedPost | unknown) {
            await actions.handlePostClick(this, post);
        },
        async handleLinkClick(payload: LinkClickPayload) {
            return actions.handleLinkClick(this, payload);
        }
    }
});

export {state, mutations, actions};

export default {
    state,
    getters: {},
    mutations,
    actions,
};
