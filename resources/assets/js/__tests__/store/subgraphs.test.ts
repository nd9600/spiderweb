import subgraphsModule from "@/src/store/modules/dataModules/subgraphs";
import type {DataModuleState} from "@/src/@types/StoreTypes";

import overallState from "./state";
let state: DataModuleState;
beforeEach(() => {
    state = JSON.parse(JSON.stringify(overallState.dataModule)) as DataModuleState;
});

test("removing posts from a subgraph removes their links from a subgraph too", () => {
    expect(Object.keys(state.subgraphs[3].links).length).toEqual(3);
    subgraphsModule.mutations.removePostFromSubgraph(state, {subgraphId: "3", postId: "1"});
    expect(Object.keys(state.subgraphs[3].links).length).toEqual(2);
    expect(state.subgraphs[3].links.includes("1")).toBeFalsy();
});
