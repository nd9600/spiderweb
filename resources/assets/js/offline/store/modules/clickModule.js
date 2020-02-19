const state = {
    clickMode: "openPosts", // openPosts | addLink

    newLinkSource: null,
    newLinkTarget: null,
    newLinkGraphId: 1,
    newLinkType: "reply",
};

const getters = {
};

const mutations = {
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
};

const actions = {
    async handleGraphClick(context, post) {
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
                    context.commit("setNewLinkSource", null);
                    context.commit("setNewLinkTarget", null);
                    context.commit("setNewLinkGraphId", 1);
                    context.commit("setNewLinkType", "reply");

                    break;
                }
            }
        }
    },
};


export default {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
};
