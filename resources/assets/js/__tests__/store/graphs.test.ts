import {createPinia, setActivePinia} from "pinia";
import {toFirebaseUpdatePatch} from "@/src/store/dataModulePatch";
import {useDataStore} from "@/src/store/modules/dataModule";

import overallState from "./state";

let store: ReturnType<typeof useDataStore>;
beforeEach(() => {
    setActivePinia(createPinia());
    store = useDataStore();
    store.setState(JSON.parse(JSON.stringify(overallState.dataModule)));
});

test("deleting graphs deletes subgraphs and links", () => {
    const patch = store.removeGraph("1");

    expect(Object.keys(store.subgraphs).length).toEqual(0);
    expect(Object.keys(store.links).length).toEqual(0);

    expect(store.selectedGraphId).toBeNull();
    expect(store.selectedSubgraphIds.length === 0).toBeTruthy();
    expect(toFirebaseUpdatePatch(patch ?? [])).toEqual({
        "dataModule/graphs/1": null,
        "dataModule/selectedGraphId": null,
        "dataModule/selectedSubgraphIds": [],
        "dataModule/subgraphs/1": null,
        "dataModule/subgraphs/2": null,
        "dataModule/subgraphs/3": null,
        "dataModule/links/1": null,
        "dataModule/links/2": null,
        "dataModule/links/3": null,
    });
});

test("removing posts from a graph removes their positions too", () => {
    expect(Object.keys(store.graphs["1"].nodePositions).length).toEqual(2);
    store.removePostFromGraph({graphId: "1", postId: "2"});
    expect(Object.keys(store.graphs["1"].nodePositions).length).toEqual(1);
    expect(store.graphs["1"].nodePositions["2"]).toBeUndefined();
});

test("removing posts from a graph removes their links from a subgraph too", () => {
    expect(Object.keys(store.subgraphs["1"].links).length).toEqual(3);
    const patch = store.removePostFromGraph({graphId: "1", postId: "1"});

    expect(Object.keys(store.subgraphs["1"].links).length).toEqual(2);
    expect(store.subgraphs["1"].links["1"]).toBeUndefined();
    expect(store.subgraphs["1"].nodes["1"]).toBeUndefined();
    expect(toFirebaseUpdatePatch(patch ?? [])).toEqual({
        "dataModule/graphs/1/nodes/1": null,
        "dataModule/graphs/1/nodePositions/1": null,
        "dataModule/links/1": null,
        "dataModule/subgraphs/1/links/1": null,
        "dataModule/subgraphs/3/links/1": null,
        "dataModule/subgraphs/1/nodes/1": null,
        "dataModule/subgraphs/2/nodes/1": null,
        "dataModule/subgraphs/3/nodes/1": null,
    });
});
