import overallState from "./state";

const state = overallState.dataModule;

import linksModule from "@/src/offline/store/modules/dataModules/links.ts";

test("deleting links removes them from subgraphs", () => {
    expect(state.subgraphs[1].links.length === 3).toBeTruthy();
    linksModule.mutations.removeLink(state, {id: 1});
    expect(state.subgraphs[1].links.length === 2).toBeTruthy();
});