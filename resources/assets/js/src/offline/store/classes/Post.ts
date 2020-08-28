import {PostId} from "@/src/@types/StoreTypes";

export interface PostSerialised {
    id: PostId;
    title: string;
    body: string;
    created_at: string;
    updated_at: string;
}

export default class Post {
    constructor(
        public id: PostId,
        public title: string,
        public body: string,
        public createdAt: string,
        public updatedAt: string
    ) {
    }

    serialise(): PostSerialised {
        return {
            id: this.id,
            title: this.title,
            body: this.body,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        }
    }

    static unserialise(post: PostSerialised): Post {
        return new Post(post.id, post.title, post.body, post.created_at, post.updated_at);
    }
}