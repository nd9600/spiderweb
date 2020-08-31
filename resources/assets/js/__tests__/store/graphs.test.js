import overallState from "./state";

const state = overallState.dataModule;

import graphsModule from "@/src/offline/store/modules/dataModules/graphs.ts";

test("deleting graphs deletes subgraphs and links", () => {
    graphsModule.mutations.removeGraph(state, 1);
    expect(Object.keys(state.subgraphs).length === 0).toBeTruthy();
    expect(Object.keys(state.links).length === 0).toBeTruthy();

    expect(state.selectedGraphId === null).toBeTruthy();
    expect(state.selectedSubgraphIds.length === 0).toBeTruthy();
});