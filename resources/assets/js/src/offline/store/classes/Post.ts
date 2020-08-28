import { PostId } from "@/src/@types/StoreTypes";

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
}