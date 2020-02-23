<template>
    <section>
        <div class="flex justify-between items-center">
            <div
                v-if="Object.keys(linkedPosts.to).length > 0"
            >
                <div
                    v-for="(postId, linkId) in linkedPosts.to"
                    :key="linkId"
                    class="mb-2"
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

            <h4
                v-if="Object.keys(linkedPosts.to).length > 0"
                class="h h--4 mx-1 flex flex-col"
            >
                <span>→</span>
                <span>→</span>
                <span>→</span>
            </h4>

            <span>
                {{ titleOrBody(post.id) }}
            </span>

            <h4
                v-if="Object.keys(linkedPosts.from).length > 0"
                class="h h--4 mx-1 flex flex-col"
            >
                <span>→</span>
                <span>→</span>
                <span>→</span>
            </h4>

            <div
                v-if="Object.keys(linkedPosts.from).length > 0"
            >
                <div
                    v-for="(postId, linkId) in linkedPosts.from"
                    :key="linkId"
                    class="mb-2"
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