import subgraphsModule from "@/src/offline/store/modules/dataModules/subgraphs";

import overallState from "./state";
let state;
beforeEach(() => {
    state = JSON.parse(JSON.stringify(overallState.dataModule));
});

test("removing posts from a subgraph removes their links from a subgraph too", () => {
    expect(Object.keys(state.subgraphs[3].links).length).toEqual(3);
    subgraphsModule.mutations.removePostFromSubgraph(state, {subgraphId: "3", postId: "1"});
    expect(Object.keys(state.subgraphs[3].links).length).toEqual(2);
    expect(state.subgraphs[3].links.includes(1)).toBeFalsy();
});