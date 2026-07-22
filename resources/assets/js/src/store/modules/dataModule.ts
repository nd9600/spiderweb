import {defineStore} from "pinia";
import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/components/constants";
import type {DataModuleState} from "@/src/@types/StoreTypes";
import graphModule from "./dataModule/graphs";
import linkModule, {type LinkWithSubgraphId} from "./dataModule/links";
import postModule, {type LinkedPostIds, type LinksByPostId} from "./dataModule/posts";
import subgraphModule, {type SubgraphIndexes} from "./dataModule/subgraphs";

export type {LinkedPostIds, LinksByPostId, LinkWithSubgraphId, SubgraphIndexes};

export const useDataStore = defineStore("dataModule", {
    state: (): DataModuleState => ({
        ...graphModule.state(),
        ...postModule.state(),
        ...linkModule.state(),
        ...subgraphModule.state(),
    }),
    getters: {
        ...graphModule.getters,
        ...postModule.getters,
        ...linkModule.getters,
        ...subgraphModule.getters,
    },
    actions: {
        setState(newState: DataModuleState) {
            if (Object.keys(newState).length === 0) {
                return;
            }

            this.graphs = newState.graphs;
            this.posts = newState.posts;
            this.links = newState.links;
            this.subgraphs = newState.subgraphs ?? {};

            this.selectedPostIds = newState.selectedPostIds ?? [];
            this.selectedGraphId = newState.selectedGraphId ?? "1";
            this.selectedSubgraphIds = newState.selectedSubgraphIds ?? [];

            this.zoom = newState.zoom || {
                x: WIDTH / 2,
                y: HEIGHT / 2,
                scale: INITIAL_ZOOM,
            };
        },
        ...graphModule.actions,
        ...postModule.actions,
        ...linkModule.actions,
        ...subgraphModule.actions,
    } satisfies ThisType<DataModuleState>,
});
