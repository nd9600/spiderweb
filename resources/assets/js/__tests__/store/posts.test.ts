import postsModule from "@/src/store/modules/dataModules/posts";
import type {DataModuleState} from "@/src/@types/StoreTypes";

import overallState from "./state";
let state: DataModuleState;
beforeEach(() => {
    state = JSON.parse(JSON.stringify(overallState.dataModule)) as DataModuleState;
});

test("deleting posts removes their positions too", () => {
    expect(Object.keys(state.graphs[1].nodePositions).length === 2).toBeTruthy();

    postsModule.mutations.deletePost(state, {id: "2"});
    expect(Object.keys(state.graphs[1].nodePositions).length === 1).toBeTruthy();
    expect(state.graphs[1].nodePositions[2]).toBeUndefined();
});
