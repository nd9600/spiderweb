const state = {
    showClickButtonMenu: false,

    clickMode: "openPosts", // openPosts | addLink

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
    setShowClickButtonMenu(state, showClickButtonMenu) {
        state.showClickButtonMenu = showClickButtonMenu;
        if (!showClickButtonMenu) {
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
                    "postsModule/selectPostId",
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
                        alert("A post can't be linked to itself");
                        return;
                    }

                    context.commit("setNewLinkTarget", post.id);

                    context.commit(
                        "postsModule/addLink",
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
                    alert("A post can't be linked to itself");
                    return;
                }
            }
        }
    },

    async handleLinkClick(context, link) {
        console.log(link);
        if (typeof link !== "object") {
            console.error("no link clicked, clicked", link);
            return;
        }

        switch (context.state.clickMode) {
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
