<template>
    <section>
        <div class="w-4/5 flex justify-between">
            <div
                v-if="linkedPosts.from.length > 0"
            >
                <h4 class="h h--4">
                    From this post
                </h4>
                <a
                    v-for="postId in linkedPosts.from"
                    :key="postId"
                    class="link block"
                    @click="togglePostIdLocal(postId)"
                >
                    {{ titleOrBody(postId) }}
                </a>
            </div>

            <div
                v-if="linkedPosts.to.length > 0"
            >
                <h4 class="h h--4">
                    To this post
                </h4>
                <a
                    v-for="postId in linkedPosts.to"
                    :key="postId"
                    class="link block"
                    @click="selectPostIdLocal(postId)"
                >
                    {{ titleOrBody(postId) }}
                </a>
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
        ...mapMutations("postsModule", ["togglePostId"]),
        togglePostIdLocal(postId) {
            this.togglePostId({
                id: postId,
                canOpenMultiplePosts: this.canOpenMultiplePosts
            });
        }
    }
};
</script>