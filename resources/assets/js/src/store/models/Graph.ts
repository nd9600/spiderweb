import {z} from "zod";
import {
    graphIdSchema,
    nodePositionSchema,
    postIdSchema,
    type GraphId,
    type NodePosition,
    type PostId
} from "./primitives";

export const graphSchema = z.object({
    id: graphIdSchema,
    name: z.string(),
    nodes: z.array(postIdSchema).default([]),
    nodePositions: z.record(z.string(), nodePositionSchema).default({}),
});

export type Graph = z.infer<typeof graphSchema>;
export type NodePositionsMap = Record<PostId, NodePosition>;

export function createGraph(
    id: GraphId,
    name: string,
    nodes: PostId[] = [],
    nodePositions: NodePositionsMap = {}
): Graph {
    return {
        id,
        name,
        nodes,
        nodePositions,
    };
}
