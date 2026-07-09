import {defineStore} from "pinia";
import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/components/constants";
import type {DataModuleState} from "@/src/@types/StoreTypes";
import {graphActions, graphGetters, graphState} from "./dataModule/graphs";
import {linkActions, linkGetters, linkState, type LinkWithSubgraphId} from "./dataModule/links";
import {postActions, postGetters, postState} from "./dataModule/posts";
import {subgraphActions, subgraphGetters, subgraphState} from "./dataModule/subgraphs";

export type {LinkWithSubgraphId};

function initialDataModuleState(): DataModuleState {
    return {
        ...graphState(),
        ...postState(),
        ...linkState(),
        ...subgraphState(),
    };
}

function setDataModuleState(state: DataModuleState, newState: DataModuleState): void {
    if (
        Object.keys(newState).length === 0
        || Object.keys(newState.posts).length === 0
    ) {
        return;
    }

    state.graphs = newState.graphs;
    state.posts = newState.posts;
    state.links = newState.links;
    state.subgraphs = newState.subgraphs ?? {};

    state.selectedPostIds = newState.selectedPostIds ?? [];
    state.selectedGraphId = newState.selectedGraphId ?? "1";
    state.selectedSubgraphIds = newState.selectedSubgraphIds ?? [];

    state.zoom = newState.zoom || {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        scale: INITIAL_ZOOM,
    };
}

const dataStateActions = {
    setState(newState: DataModuleState) {
        setDataModuleState(this, newState);
    },
} satisfies ThisType<DataModuleState>;

export const useDataStore = defineStore("dataModule", {
    state: (): DataModuleState => initialDataModuleState(),
    getters: {
        ...graphGetters,
        ...postGetters,
        ...linkGetters,
        ...subgraphGetters,
    },
    actions: {
        ...dataStateActions,
        ...graphActions,
        ...postActions,
        ...linkActions,
        ...subgraphActions,
    },
});
