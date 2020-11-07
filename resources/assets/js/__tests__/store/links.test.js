import linksModule from "@/src/offline/store/modules/dataModules/links";

import overallState from "./state";
let state;
beforeEach(() => {
    state = JSON.parse(JSON.stringify(overallState.dataModule));
});

test("deleting links removes them from subgraphs", () => {
    expect(state.subgraphs[1].links.length === 3).toBeTruthy();
    linksModule.mutations.removeLink(state, {id: "1"});
    expect(state.subgraphs[1].links.length === 2).toBeTruthy();
});