import overallState from "./state";

const state = overallState.dataModule;

import postsModule from "@/src/offline/store/modules/dataModules/posts";

test("deleting posts removes their positions too", () => {
    expect(Object.keys(state.graphs[1].nodePositions).length === 2).toBeTruthy();

    postsModule.mutations.deletePost(state, {id: 2});
    expect(Object.keys(state.graphs[1].nodePositions).length === 1).toBeTruthy();
    expect(state.graphs[1].nodePositions[2]).toBeUndefined();
});