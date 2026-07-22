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

test("deleting posts cascades through graph and subgraph state", () => {
    expect(Object.keys(store.graphs["1"].nodePositions).length === 2).toBeTruthy();

    const patch = store.deletePost({id: "2"});

    expect(store.posts["2"]).toBeUndefined();
    expect(store.graphs["1"].nodes["2"]).toBeUndefined();
    expect(store.subgraphs["1"].nodes["2"]).toBeUndefined();
    expect(Object.keys(store.graphs["1"].nodePositions).length === 1).toBeTruthy();
    expect(store.graphs["1"].nodePositions["2"]).toBeUndefined();
    expect(Object.values(store.links).some((link) => link.source === "2" || link.target === "2")).toBeFalsy();
    expect(toFirebaseUpdatePatch(patch ?? [])).toEqual({
        "dataModule/posts/2": null,
        "dataModule/selectedPostIds": ["4"],
        "dataModule/links/1": null,
        "dataModule/subgraphs/1/links/1": null,
        "dataModule/subgraphs/2/links/1": null,
        "dataModule/subgraphs/3/links/1": null,
        "dataModule/links/2": null,
        "dataModule/subgraphs/1/links/2": null,
        "dataModule/subgraphs/2/links/2": null,
        "dataModule/subgraphs/3/links/2": null,
        "dataModule/links/3": null,
        "dataModule/subgraphs/1/links/3": null,
        "dataModule/subgraphs/2/links/3": null,
        "dataModule/subgraphs/3/links/3": null,
        "dataModule/graphs/1/nodes/2": null,
        "dataModule/graphs/1/nodePositions/2": null,
        "dataModule/subgraphs/1/nodes/2": null,
        "dataModule/subgraphs/2/nodes/2": null,
        "dataModule/subgraphs/3/nodes/2": null,
    });
});
