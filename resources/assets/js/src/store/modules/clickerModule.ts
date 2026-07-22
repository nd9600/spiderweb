import {defineStore} from "pinia";

import {ClickMode, type LinkId, type LinkType, type PostId, type SubgraphId} from "@/src/@types/StoreTypes";
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

export const useClickerStore = defineStore("clickerModule", {
    state: (): ClickerModuleState => ({
        shouldShowClickButtonMenu: false,
        clickMode: ClickMode.OpenPosts,
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
            if (clickMode === ClickMode.AddLink) {
                this.newLinkSubgraphIds = [...useDataStore().selectedSubgraphIds];
            }
        },
        async handlePostClick(post: {id: PostId}) {
            const dataStore = useDataStore();
            const settingsStore = useSettingsStore();

            switch (this.clickMode) {
                case ClickMode.OpenPosts:
                default: {
                    dataStore.selectPostId({
                        id: post.id,
                        canOpenMultiplePosts: settingsStore.canOpenMultiplePosts,
                    });
                    break;
                }

                case ClickMode.AddLink: {
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

                    this.clickMode = ClickMode.OpenPosts;
                    this.newLinkSource = null;
                    this.newLinkTarget = null;
                    this.newLinkSubgraphIds = [];

                    break;
                }

                case ClickMode.ChangeLink: {
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
                    this.clickMode = ClickMode.OpenPosts;
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
                case ClickMode.OpenPosts: {
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
                case ClickMode.ChangeLink: {
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
