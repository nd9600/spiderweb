import { PostId } from "@/src/@types/StoreTypes";

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