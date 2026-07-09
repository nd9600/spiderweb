import {createPinia, setActivePinia} from "pinia";
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
    store.removeLink({id: "1"});
    expect(Object.keys(store.subgraphs["1"].links).length === 2).toBeTruthy();
    expect(store.subgraphs["1"].links["1"]).toBeUndefined();
});
