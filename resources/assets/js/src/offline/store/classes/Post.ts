import {PostId} from "@/src/@types/StoreTypes";

export interface PostSerialised {
    id: PostId;
    title: string;
    body: string;
    createdAt: string;
    updatedAt: string;
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
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }

    static unserialise(post: PostSerialised): Post {
        return new Post(String(post.id), post.title, post.body, post.createdAt, post.updatedAt);
    }
}