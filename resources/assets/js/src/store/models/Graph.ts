import {z} from "zod";
import {
    graphIdSchema,
    idsToMembershipMap,
    type IdMembershipMap,
    nodePositionSchema,
    postIdSchema,
    type GraphId,
    type NodePosition,
    type PostId
} from "./primitives";

export const postMembershipMapSchema = z.record(z.string(), z.literal(true)).default({});
export const importedPostMembershipMapSchema = z.union([
    postMembershipMapSchema,
    z.array(postIdSchema).transform(idsToMembershipMap),
]).default({});

export const graphSchema = z.object({
    id: graphIdSchema,
    name: z.string(),
    nodes: postMembershipMapSchema,
    nodePositions: z.record(z.string(), nodePositionSchema).default({}),
});

export type Graph = z.infer<typeof graphSchema>;
export type NodePositionsMap = Record<PostId, NodePosition>;
export type PostMembershipMap = IdMembershipMap<PostId>;

export function createGraph(
    id: GraphId,
    name: string,
    nodes: PostMembershipMap = {},
    nodePositions: NodePositionsMap = {}
): Graph {
    return {
        id,
        name,
        nodes,
        nodePositions,
    };
}
