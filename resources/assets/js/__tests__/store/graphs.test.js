import overallState from "./state";

const state = overallState.dataModule;

import graphsModule from "@/src/offline/store/modules/dataModules/graphs";
import postsModule from "@/src/offline/store/modules/dataModules/posts";

test("deleting graphs deletes subgraphs and links", () => {
    graphsModule.mutations.removeGraph(state, 1);
    expect(Object.keys(state.subgraphs).length === 0).toBeTruthy();
    expect(Object.keys(state.links).length === 0).toBeTruthy();

    expect(state.selectedGraphId === null).toBeTruthy();
    expect(state.selectedSubgraphIds.length === 0).toBeTruthy();
});

test("removing posts from a graph removes their positions too", () => {
    expect(Object.keys(state.graphs[1].nodePositions).length === 2).toBeTruthy();
    graphsModule.mutations.removePostFromGraph(state, {graphId: 1, postId: 2});
    expect(Object.keys(state.graphs[1].nodePositions).length === 1).toBeTruthy();
});