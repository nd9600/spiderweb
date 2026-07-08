import {createPinia, setActivePinia} from "pinia";
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
    store.removePostFromSubgraph({subgraphId: "3", postId: "1"});
    expect(Object.keys(store.subgraphs["3"].links).length).toEqual(2);
    expect(store.subgraphs["3"].links.includes("1")).toBeFalsy();
    expect(store.subgraphs["3"].nodes.includes("1")).toBeFalsy();
});
