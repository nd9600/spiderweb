import {createPinia, setActivePinia} from "pinia";
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

    store.deletePost({id: "2"});

    expect(store.posts["2"]).toBeUndefined();
    expect(store.graphs["1"].nodes.includes("2")).toBeFalsy();
    expect(store.subgraphs["1"].nodes.includes("2")).toBeFalsy();
    expect(Object.keys(store.graphs["1"].nodePositions).length === 1).toBeTruthy();
    expect(store.graphs["1"].nodePositions["2"]).toBeUndefined();
    expect(Object.values(store.links).some((link) => link.source === "2" || link.target === "2")).toBeFalsy();
});
