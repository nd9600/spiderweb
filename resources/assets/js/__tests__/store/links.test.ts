import linksModule from "@/src/offline/store/modules/dataModules/links";
import type {DataModuleState} from "@/src/@types/StoreTypes";

import overallState from "./state";
let state: DataModuleState;
beforeEach(() => {
    state = JSON.parse(JSON.stringify(overallState.dataModule)) as DataModuleState;
});

test("deleting links removes them from subgraphs", () => {
    expect(state.subgraphs[1].links.length === 3).toBeTruthy();
    linksModule.mutations.removeLink(state, {id: "1"});
    expect(state.subgraphs[1].links.length === 2).toBeTruthy();
});
