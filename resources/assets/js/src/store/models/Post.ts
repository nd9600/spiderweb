import {z} from "zod";
import {postIdSchema, type PostId} from "./primitives";

export const postSchema = z.object({
    id: postIdSchema,
    title: z.string(),
    body: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type Post = z.infer<typeof postSchema>;

export const importedPostSchema = z.object({
    id: postIdSchema,
    title: z.string(),
    body: z.string(),
    createdAt: z.string(),
    updatedAt: z.string().nullish(),
}).transform((post): Post => ({
    ...post,
    updatedAt: post.updatedAt ?? post.createdAt,
}));

export function createPost(
    id: PostId,
    title: string,
    body: string,
    createdAt: string,
    updatedAt: string
): Post {
    return {
        id,
        title,
        body,
        createdAt,
        updatedAt,
    };
}
