import {z} from "zod";
import {
    graphIdSchema,
    linkIdSchema,
    postIdSchema,
    subgraphIdSchema,
    type GraphId,
    type LinkId,
    type PostId,
    type SubgraphId
} from "./primitives";

export const subgraphSchema = z.object({
    id: subgraphIdSchema,
    graph: graphIdSchema,
    name: z.string(),
    nodes: z.array(postIdSchema).default([]),
    links: z.array(linkIdSchema).default([]),
    colour: z.string().optional(),
});

export type Subgraph = z.infer<typeof subgraphSchema>;

export function createSubgraph(
    id: SubgraphId,
    graph: GraphId,
    name: string,
    nodes: PostId[] = [],
    links: LinkId[] = [],
    colour?: string
): Subgraph {
    return {
        id,
        graph,
        name,
        nodes,
        links,
        colour,
    };
}
