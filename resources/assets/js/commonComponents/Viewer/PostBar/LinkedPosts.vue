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
                        <a
                            class="link text-xs md:text-sm"
                            title="view this post"
                            @click="togglePostIdLocal(postId)"
                        >
                            {{ titleOrBody(postId) }}
                        </a>
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
                        <a
                            class="link text-xs md:text-sm"
                            @click="togglePostIdLocal(postId)"
                        >
                            {{ titleOrBody(postId) }}
                        </a>
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