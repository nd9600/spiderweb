import {z} from "zod";
import {HEIGHT, INITIAL_ZOOM, WIDTH} from "@/src/components/constants";
import {graphSchema, importedPostMembershipMapSchema} from "./Graph";
import {linkSchema} from "./Link";
import {postSchema} from "./Post";
import {importedLinkMembershipMapSchema, subgraphSchema} from "./Subgraph";
import {
    graphIdSchema,
    nodePositionSchema,
    postIdSchema,
    subgraphIdSchema,
    zoomSchema,
} from "./primitives";

export const defaultZoom = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    scale: INITIAL_ZOOM,
};
export const dataModuleZoomSchema = zoomSchema.default(defaultZoom);

export const graphsSchema = z.record(z.string(), graphSchema).default({});
export const postsSchema = z.record(z.string(), postSchema).default({});
export const linksSchema = z.record(z.string(), linkSchema).default({});
export const subgraphsSchema = z.record(z.string(), subgraphSchema).default({});

export const dataModuleStateSchema = z.object({
    graphs: graphsSchema,
    posts: postsSchema,
    links: linksSchema,
    subgraphs: subgraphsSchema,
    selectedPostIds: z.array(postIdSchema).default([]),
    selectedGraphId: graphIdSchema.nullable().default("1"),
    selectedSubgraphIds: z.array(subgraphIdSchema).default([]),
    zoom: dataModuleZoomSchema,
});

export type DataModuleState = z.infer<typeof dataModuleStateSchema>;

const legacyGraphSchema = z.object({
    id: graphIdSchema,
    name: z.string(),
    nodes: importedPostMembershipMapSchema,
    nodePositions: z.record(z.string(), nodePositionSchema).default({}),
    subgraphs: z.array(subgraphIdSchema).default([]),
});

const legacySubgraphSchema = z.object({
    id: subgraphIdSchema,
    graph: graphIdSchema.optional(),
    name: z.string(),
    nodes: importedPostMembershipMapSchema,
    links: importedLinkMembershipMapSchema,
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
    zoom: dataModuleZoomSchema,
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
            graph: subgraph.graph ?? subgraphGraphIds[subgraphId] ?? legacyState.selectedGraphId ?? firstGraphId,
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
