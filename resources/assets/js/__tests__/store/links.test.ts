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

test("deleting links removes them from subgraphs", () => {
    expect(Object.keys(store.subgraphs["1"].links).length === 3).toBeTruthy();
    const patch = store.removeLink({id: "1"});

    expect(Object.keys(store.subgraphs["1"].links).length === 2).toBeTruthy();
    expect(store.subgraphs["1"].links["1"]).toBeUndefined();
    expect(toFirebaseUpdatePatch(patch ?? [])).toEqual({
        "dataModule/links/1": null,
        "dataModule/subgraphs/1/links/1": null,
        "dataModule/subgraphs/3/links/1": null,
    });
});
