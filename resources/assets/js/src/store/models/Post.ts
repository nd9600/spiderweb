import type {PostId} from "@/src/@types/StoreTypes";

export interface Post {
    id: PostId;
    title: string;
    body: string;
    createdAt: string;
    updatedAt: string;
}

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
