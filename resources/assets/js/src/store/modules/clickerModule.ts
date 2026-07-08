import {defineStore} from "pinia";

import type {ClickMode, LinkId, LinkType, PostId, SubgraphId} from "@/src/@types/StoreTypes";
import {useDataStore} from "./dataModule";
import {useSettingsStore} from "./settingsModule";

interface ClickerModuleState {
    shouldShowClickButtonMenu: boolean;
    clickMode: ClickMode;
    newLinkSource: Nullable<PostId>;
    newLinkTarget: Nullable<PostId>;
    newLinkType: LinkType;
    newLinkSubgraphIds: SubgraphId[];
    linkToEdit: Nullable<LinkId>;
    wantsToChangeSource: boolean;
    wantsToChangeTarget: boolean;
}

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

function isClickedPost(post: unknown): post is ClickedPost {
    return typeof post === "object"
        && post !== null
        && "id" in post
        && typeof post.id === "string";
}

export const useClickerStore = defineStore("clickerModule", {
    state: (): ClickerModuleState => ({
        shouldShowClickButtonMenu: false,
        clickMode: "openPosts",
        newLinkSource: null,
        newLinkTarget: null,
        newLinkType: "reply",
        newLinkSubgraphIds: [],
        linkToEdit: null,
        wantsToChangeSource: false,
        wantsToChangeTarget: false,
    }),
    actions: {
        setShouldShowClickButtonMenu(shouldShowClickButtonMenu: boolean) {
            this.shouldShowClickButtonMenu = shouldShowClickButtonMenu;
            if (!shouldShowClickButtonMenu) {
                this.newLinkSource = null;
                this.newLinkTarget = null;
                this.newLinkType = "reply";
                this.newLinkSubgraphIds = [];
                this.linkToEdit = null;
                this.wantsToChangeSource = false;
                this.wantsToChangeTarget = false;
            }
        },
        setClickMode(clickMode: ClickMode) {
            this.clickMode = clickMode;
        },
        setNewLinkSource(newLinkSource: Nullable<PostId>) {
            this.newLinkSource = newLinkSource;
        },
        setNewLinkTarget(newLinkTarget: Nullable<PostId>) {
            this.newLinkTarget = newLinkTarget;
        },
        setNewLinkType(newLinkType: LinkType) {
            this.newLinkType = newLinkType;
        },
        setNewLinkSubgraphIds(newLinkSubgraphIds: SubgraphId[]) {
            this.newLinkSubgraphIds = newLinkSubgraphIds;
        },
        setLinkToEdit(linkToEdit: Nullable<LinkId>) {
            this.linkToEdit = linkToEdit;
        },
        setWantsToChangeSource(wantsToChangeSource: boolean) {
            this.wantsToChangeSource = wantsToChangeSource;
        },
        setWantsToChangeTarget(wantsToChangeTarget: boolean) {
            this.wantsToChangeTarget = wantsToChangeTarget;
        },
        async handlePostClick(post: unknown) {
            if (!isClickedPost(post)) {
                console.error("no post clicked, clicked", post);
                return;
            }

            const dataStore = useDataStore();
            const settingsStore = useSettingsStore();

            switch (this.clickMode) {
                case "openPosts":
                default: {
                    dataStore.selectPostId({
                        id: post.id,
                        canOpenMultiplePosts: settingsStore.canOpenMultiplePosts,
                    });
                    break;
                }

                case "addLink": {
                    if (this.newLinkSource == null) {
                        this.newLinkSource = post.id;
                        break;
                    }

                    const newLinkSource = this.newLinkSource;
                    if (newLinkSource === post.id) {
                        return;
                    }

                    this.newLinkTarget = post.id;
                    dataStore.addLink({
                        source: newLinkSource,
                        target: post.id,
                        graph: dataStore.selectedGraphId!,
                        type: this.newLinkType,
                        subgraphIds: this.newLinkSubgraphIds,
                    });

                    this.clickMode = "openPosts";
                    this.newLinkSource = null;
                    this.newLinkTarget = null;
                    this.newLinkSubgraphIds = [];

                    break;
                }

                case "changeLink": {
                    if (this.wantsToChangeSource) {
                        if (this.linkToEdit == null) {
                            return;
                        }
                        dataStore.changeLinkSource({
                            id: this.linkToEdit,
                            source: post.id,
                        });
                        this.wantsToChangeSource = false;
                    } else if (this.wantsToChangeTarget) {
                        if (this.linkToEdit == null) {
                            return;
                        }
                        dataStore.changeLinkTarget({
                            id: this.linkToEdit,
                            target: post.id,
                        });
                        this.wantsToChangeTarget = false;
                    }
                    this.clickMode = "openPosts";
                    this.linkToEdit = null;
                }
            }
        },
        async handleLinkClick({link, coordinates}: LinkClickPayload) {
            if (typeof link !== "object") {
                console.error("no link clicked, clicked", link);
                return;
            }

            switch (this.clickMode) {
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
                    }
                    return;
                }
                case "changeLink": {
                    this.linkToEdit = link.id;
                    break;
                }
                default: {
                    return;
                }
            }

            return;
        },
    },
});
