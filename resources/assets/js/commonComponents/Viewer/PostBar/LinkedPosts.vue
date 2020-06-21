<template>
    <section>
        <div class="flex justify-between items-center">
            <template v-if="Object.keys(linkedPosts.to).length > 0">
                <div>
                    <div
                        v-for="(postId, linkId) in linkedPosts.to"
                        :key="linkId"
                        class="mb-4 flex justify-between items-start"
                    >
                        <div
                            class="p-1 cursor-pointer bg-red-200 hover:bg-red-300 rounded-lg text-xs md:text-sm"
                            title="view this post"
                            @click="togglePostIdLocal(postId)"
                        >
                            <span
                                v-if="posts[postId].title.length > 0"
                                class="font-bold"
                            >
                                {{ posts[postId].title }}
                            </span>
                            <p
                                v-if="posts[postId].body.length > 0"
                                class="text-xs"
                            >
                                {{ posts[postId].body.substr(0, 200) }}{{ posts[postId].body.length > 200 ? "..." : "" }}
                            </p>
                        </div>
                        <button
                            class="ml-2 py-1 px-2 btn btn--secondary"
                            title="remove link"
                            @click="removeLink({id: linkId})"
                        >
                            x
                        </button>
                    </div>
                </div>

                <h4 class="h h--4 mx-4 flex flex-col">
                    <span>→</span>
                    <span>→</span>
                    <span>→</span>
                </h4>
            </template>

            <span>
                {{ titleOrBody(post.id) }}
            </span>

            <template v-if="Object.keys(linkedPosts.from).length > 0">
                <h4 class="h h--4 mx-4 flex flex-col">
                    <span>→</span>
                    <span>→</span>
                    <span>→</span>
                </h4>

                <div>
                    <div
                        v-for="(postId, linkId) in linkedPosts.from"
                        :key="linkId"
                        class="mb-4 flex justify-between items-start"
                    >
                        <div
                            class="p-1 cursor-pointer bg-red-200 hover:bg-red-300 rounded-lg text-xs md:text-sm"
                            title="view this post"
                            @click="togglePostIdLocal(postId)"
                        >
                            <span
                                v-if="posts[postId].title.length > 0"
                                class="font-bold"
                            >
                                {{ posts[postId].title }}
                            </span>
                            <p
                                v-if="posts[postId].body.length > 0"
                                class="text-xs"
                            >
                                {{ posts[postId].body.substr(0, 200) }}{{ posts[postId].body.length > 200 ? "..." : "" }}
                            </p>
                        </div>
                        <button
                            class="ml-2 py-1 px-2 btn btn--secondary"
                            title="remove link"
                            @click="removeLink({id: linkId})"
                        >
                            x
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </section>
</template>

<script>
import {mapState, mapGetters, mapMutations} from "vuex";

export default {
    name: "LinkedPosts",
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapState("settingsModule", ["canOpenMultiplePosts"]),
        ...mapState("postsModule", ["posts"]),
        ...mapGetters("postsModule", ["titleOrBody", "postIdsThatLinkToPost"]),

        linkedPosts() {
            return this.postIdsThatLinkToPost(this.post.id);
        }
    },
    methods: {
        ...mapMutations("postsModule", ["togglePostId", "removeLink"]),
        togglePostIdLocal(postId) {
            this.togglePostId({
                id: postId,
                canOpenMultiplePosts: this.canOpenMultiplePosts
            });
        }
    }
};
</script>