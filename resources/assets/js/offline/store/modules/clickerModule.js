const state = {
    shouldShowClickButtonMenu: false,

    clickMode: "openPosts", // openPosts | addLink | changeLink | addPost | attachPostsToGraphs

    newLinkSource: null,
    newLinkTarget: null,
    newLinkGraphId: 1,
    newLinkType: "reply",

    linkToEdit: null,
    wantsToChangeSource: false,
    wantsToChangeTarget: false,
};

const getters = {
};

const mutations = {
    setShouldShowClickButtonMenu(state, shouldShowClickButtonMenu) {
        state.shouldShowClickButtonMenu = shouldShowClickButtonMenu;
        if (!shouldShowClickButtonMenu) {
            state.newLinkSource = null;
            state.newLinkTarget = null;
            state.newLinkGraphId = 1;
            state.newLinkType = "reply";

            state.linkToEdit = null;
            state.wantsToChangeSource = false;
            state.wantsToChangeTarget = false;
        }
    },

    setClickMode(state, clickMode) {
        state.clickMode = clickMode;
    },
    setNewLinkSource(state, newLinkSource) {
        state.newLinkSource = newLinkSource;
    },
    setNewLinkTarget(state, newLinkTarget) {
        state.newLinkTarget = newLinkTarget;
    },
    setNewLinkGraphId(state, newLinkGraphId) {
        state.newLinkGraphId = newLinkGraphId;
    },
    setNewLinkType(state, newLinkType) {
        state.newLinkType = newLinkType;
    },

    setLinkToEdit(state, linkToEdit) {
        state.linkToEdit = linkToEdit;
    },
    setWantsToChangeSource(state, wantsToChangeSource) {
        state.wantsToChangeSource = wantsToChangeSource;
    },
    setWantsToChangeTarget(state, wantsToChangeTarget) {
        state.wantsToChangeTarget = wantsToChangeTarget;
    },
};

const actions = {
    async handlePostClick(context, post) {
        if (typeof post !== "object") {
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
                            target: context.state.newLinkTarget,
                            graph: context.state.newLinkGraphId,
                            type: context.state.newLinkType
                        },
                        {
                            root: true
                        }
                    );
                    context.commit("setClickMode", "openPosts");
                    context.commit("setNewLinkSource", null);
                    context.commit("setNewLinkTarget", null);

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

    async handleLinkClick(context, {link, coordinates}) {
        if (typeof link !== "object") {
            console.error("no link clicked, clicked", link);
            return;
        }

        switch (context.state.clickMode) {
            case "openPosts": {
                const sourceCoordinates = [link.source.x, link.source.y];
                const targetCoordinates = [link.target.x, link.target.y];

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
    }
};


export default {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};
