import {z} from "zod";
import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/components/constants";
import {graphSchema} from "./Graph";
import {linkSchema} from "./Link";
import {postSchema} from "./Post";
import {subgraphSchema} from "./Subgraph";
import {
    graphIdSchema,
    linkIdSchema,
    nodePositionSchema,
    postIdSchema,
    subgraphIdSchema,
    zoomSchema,
} from "./primitives";

const defaultZoom = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    scale: INITIAL_ZOOM,
};

export const dataModuleStateSchema = z.object({
    graphs: z.record(z.string(), graphSchema),
    posts: z.record(z.string(), postSchema),
    links: z.record(z.string(), linkSchema),
    subgraphs: z.record(z.string(), subgraphSchema).default({}),
    selectedPostIds: z.array(postIdSchema).default([]),
    selectedGraphId: graphIdSchema.nullable().default("1"),
    selectedSubgraphIds: z.array(subgraphIdSchema).default([]),
    zoom: zoomSchema.default(defaultZoom),
});

export type DataModuleState = z.infer<typeof dataModuleStateSchema>;

const legacyGraphSchema = z.object({
    id: graphIdSchema,
    name: z.string(),
    nodes: z.array(postIdSchema).default([]),
    nodePositions: z.record(z.string(), nodePositionSchema).default({}),
    subgraphs: z.array(subgraphIdSchema).default([]),
});

const legacySubgraphSchema = z.object({
    id: subgraphIdSchema,
    name: z.string(),
    nodes: z.array(postIdSchema).default([]),
    links: z.array(linkIdSchema).default([]),
    colour: z.string().optional(),
});

const legacyDataModuleStateSchema = z.object({
    graphs: z.record(z.string(), legacyGraphSchema),
    posts: z.record(z.string(), postSchema),
    links: z.record(z.string(), linkSchema),
    subgraphs: z.record(z.string(), legacySubgraphSchema).nullish().default({}),
    selectedPostIds: z.array(postIdSchema).default([]),
    selectedGraphId: graphIdSchema.nullable().default("1"),
    selectedSubgraphIds: z.array(subgraphIdSchema).default([]),
    zoom: zoomSchema.default(defaultZoom),
}).transform((legacyState): DataModuleState => {
    const graphs: DataModuleState["graphs"] = {};
    for (const [graphId, graph] of Object.entries(legacyState.graphs)) {
        graphs[graphId] = {
            id: graph.id,
            name: graph.name,
            nodes: graph.nodes,
            nodePositions: graph.nodePositions,
        };
    }

    const firstGraphId = Object.keys(graphs)[0] ?? "1";
    const subgraphGraphIds: Record<string, string> = {};
    for (const graph of Object.values(legacyState.graphs)) {
        for (const subgraphId of graph.subgraphs) {
            subgraphGraphIds[subgraphId] = graph.id;
        }
    }

    const subgraphs: DataModuleState["subgraphs"] = {};
    for (const [subgraphId, subgraph] of Object.entries(legacyState.subgraphs ?? {})) {
        subgraphs[subgraphId] = {
            id: subgraph.id,
            graph: subgraphGraphIds[subgraphId] ?? legacyState.selectedGraphId ?? firstGraphId,
            name: subgraph.name,
            nodes: subgraph.nodes,
            links: subgraph.links,
            colour: subgraph.colour,
        };
    }

    return {
        graphs,
        posts: legacyState.posts,
        links: legacyState.links,
        subgraphs,
        selectedPostIds: legacyState.selectedPostIds,
        selectedGraphId: legacyState.selectedGraphId,
        selectedSubgraphIds: legacyState.selectedSubgraphIds,
        zoom: legacyState.zoom,
    };
});

export const importedDataModuleStateSchema = z.union([
    dataModuleStateSchema,
    legacyDataModuleStateSchema,
]);
