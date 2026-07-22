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

test("removing posts from a subgraph removes their links from a subgraph too", () => {
    expect(Object.keys(store.subgraphs["3"].links).length).toEqual(3);
    const patch = store.removePostFromSubgraph({subgraphId: "3", postId: "1"});

    expect(Object.keys(store.subgraphs["3"].links).length).toEqual(2);
    expect(store.subgraphs["3"].links["1"]).toBeUndefined();
    expect(store.subgraphs["3"].nodes["1"]).toBeUndefined();
    expect(toFirebaseUpdatePatch(patch ?? [])).toEqual({
        "dataModule/subgraphs/3/nodes/1": null,
        "dataModule/subgraphs/3/links/1": null,
    });
});
