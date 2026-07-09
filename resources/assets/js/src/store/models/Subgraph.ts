import {z} from "zod";
import {
    graphIdSchema,
    idsToMembershipMap,
    type IdMembershipMap,
    linkIdSchema,
    subgraphIdSchema,
    type GraphId,
    type LinkId,
    type SubgraphId
} from "./primitives";
import {postMembershipMapSchema, type PostMembershipMap} from "./Graph";

export const linkMembershipMapSchema = z.record(z.string(), z.literal(true)).default({});
export const importedLinkMembershipMapSchema = z.union([
    linkMembershipMapSchema,
    z.array(linkIdSchema).transform(idsToMembershipMap),
]).default({});

export const subgraphSchema = z.object({
    id: subgraphIdSchema,
    graph: graphIdSchema,
    name: z.string(),
    nodes: postMembershipMapSchema,
    links: linkMembershipMapSchema,
    colour: z.string().optional(),
});

export type Subgraph = z.infer<typeof subgraphSchema>;
export type LinkMembershipMap = IdMembershipMap<LinkId>;

export function createSubgraph(
    id: SubgraphId,
    graph: GraphId,
    name: string,
    nodes: PostMembershipMap = {},
    links: LinkMembershipMap = {},
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
