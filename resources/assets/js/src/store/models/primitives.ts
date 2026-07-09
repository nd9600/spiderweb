import {z} from "zod";

export const graphIdSchema = z.coerce.string();
export const postIdSchema = z.coerce.string();
export const linkIdSchema = z.coerce.string();
export const subgraphIdSchema = z.coerce.string();

export const linkTypeSchema = z.enum(["reply", "sidenote", "link"]);

export const nodePositionSchema = z.object({
    x: z.number(),
    y: z.number(),
});

export const zoomSchema = z.object({
    x: z.number(),
    y: z.number(),
    scale: z.number(),
});

export type GraphId = z.infer<typeof graphIdSchema>;
export type PostId = z.infer<typeof postIdSchema>;
export type LinkId = z.infer<typeof linkIdSchema>;
export type SubgraphId = z.infer<typeof subgraphIdSchema>;
export type LinkType = z.infer<typeof linkTypeSchema>;
export type NodePosition = z.infer<typeof nodePositionSchema>;
export type Zoom = z.infer<typeof zoomSchema>;
