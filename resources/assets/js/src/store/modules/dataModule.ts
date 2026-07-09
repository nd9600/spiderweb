import {defineStore} from "pinia";
import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/components/constants";
import type {
    DataModuleState,
    GraphId,
    PostId,
    SubgraphId,
    Zoom
} from "@/src/@types/StoreTypes";
import Graph, {type GraphSerialised} from "@/src/store/classes/Graph";
import Link, {type LinkSerialised} from "@/src/store/classes/Link";
import Post, {type PostSerialised} from "@/src/store/classes/Post";
import Subgraph, {type SubgraphSerialised} from "@/src/store/classes/Subgraph";
import {graphActions, graphGetters, graphState} from "./dataModule/graphs";
import {linkActions, linkGetters, linkState, type LinkWithSubgraphId} from "./dataModule/links";
import {postActions, postGetters, postState} from "./dataModule/posts";
import {subgraphActions, subgraphGetters, subgraphState} from "./dataModule/subgraphs";

export type {LinkWithSubgraphId};

export interface DataModuleStateSerialised {
    graphs: Record<string, GraphSerialised>;
    posts: Record<string, PostSerialised>;
    links: Record<string, LinkSerialised>;
    subgraphs: Record<string, SubgraphSerialised>;

    selectedPostIds: PostId[];
    selectedGraphId: Nullable<GraphId>;
    selectedSubgraphIds: SubgraphId[];
    zoom: Zoom;
}

function initialDataModuleState(): DataModuleState {
    return {
        ...graphState(),
        ...postState(),
        ...linkState(),
        ...subgraphState(),
    };
}

function setDataModuleState(state: DataModuleState, newState: DataModuleStateSerialised): void {
    if (
        Object.keys(newState).length === 0
        || Object.keys(newState.posts).length === 0
    ) {
        return;
    }

    const graphs: Record<string, GraphSerialised> = {};
    for (const [id, graph] of Object.entries(newState.graphs)) {
        graphs[id] = Graph.unserialise(graph).serialise();
    }
    state.graphs = graphs;

    const posts: Record<string, PostSerialised> = {};
    for (const [id, post] of Object.entries(newState.posts)) {
        posts[id] = Post.unserialise(post).serialise();
    }
    state.posts = posts;

    const links: Record<string, LinkSerialised> = {};
    for (const [id, link] of Object.entries(newState.links)) {
        links[id] = Link.unserialise(link).serialise();
    }
    state.links = links;

    const subgraphs: Record<string, SubgraphSerialised> = {};
    for (const [id, subgraph] of Object.entries(newState.subgraphs ?? {})) {
        subgraphs[id] = Subgraph.unserialise(subgraph).serialise();
    }
    state.subgraphs = subgraphs;

    state.selectedPostIds = newState.selectedPostIds.map(String) || [];
    state.selectedGraphId = String(newState.selectedGraphId) || "1";
    state.selectedSubgraphIds = newState.selectedSubgraphIds.map(String) || [];

    state.zoom = newState.zoom || {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        scale: INITIAL_ZOOM,
    };
}

const dataStateActions = {
    setState(newState: DataModuleStateSerialised) {
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
