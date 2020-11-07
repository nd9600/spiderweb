import graphsModule from "@/src/offline/store/modules/dataModules/graphs";

import overallState from "./state";
let state;
beforeEach(() => {
    state = JSON.parse(JSON.stringify(overallState.dataModule));
});

test("deleting graphs deletes subgraphs and links", () => {
    graphsModule.mutations.removeGraph(state, "1");
    expect(Object.keys(state.subgraphs).length).toEqual(0);
    expect(Object.keys(state.links).length).toEqual(0);

    expect(state.selectedGraphId).toBeNull();
    expect(state.selectedSubgraphIds.length === 0).toBeTruthy();
});

test("removing posts from a graph removes their positions too", () => {
    expect(Object.keys(state.graphs[1].nodePositions).length).toEqual(2);
    graphsModule.mutations.removePostFromGraph(state, {graphId: "1", postId: "2"});
    expect(Object.keys(state.graphs[1].nodePositions).length).toEqual(1);
    expect(state.graphs[1].nodePositions[2]).toBeUndefined();
});

test("removing posts from a graph removes their links from a subgraph too", () => {
    expect(Object.keys(state.subgraphs[1].links).length).toEqual(3);
    graphsModule.mutations.removePostFromGraph(state, {graphId: "1", postId: "1"});
    expect(Object.keys(state.subgraphs[1].links).length).toEqual(2);
    expect(state.subgraphs[1].links.includes(1)).toBeFalsy();
});