import {z} from "zod";
import {
    graphIdSchema,
    linkIdSchema,
    linkTypeSchema,
    postIdSchema,
    type GraphId,
    type LinkId,
    type LinkType,
    type PostId
} from "./primitives";

export const linkSchema = z.object({
    id: linkIdSchema,
    graph: graphIdSchema,
    source: postIdSchema,
    target: postIdSchema,
    type: linkTypeSchema.default("reply"),
});

export type Link = z.infer<typeof linkSchema>;

export function createLink(
    id: LinkId,
    graph: GraphId,
    source: PostId,
    target: PostId,
    type: LinkType = "reply"
): Link {
    return {
        id,
        graph,
        source,
        target,
        type,
    };
}
