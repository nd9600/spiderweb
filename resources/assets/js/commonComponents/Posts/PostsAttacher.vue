<template>
    <div>
        <section
            v-if="unattachedPosts.length > 0"
            class="w-full mb-4 border-b border-red-500"
        >
            <h4 class="h h--4">
                Posts that haven't been attached to any graph yet
            </h4>

            <PostAttacher
                v-for="post in unattachedPosts"
                :key="post.id"
                :post="post"
            />
        </section>
        <section class="mb-4">
            <h4 class="h h--4">
                Search for posts
            </h4>
            <PostSearch
                class="ml-2"
                @clickedOnResult="onPostClick($event)"
            />
        </section>
        <section
            v-if="postToAttach !== null"
        >
            <h4 class="h h--4">
                Attach post
            </h4>
            <PostAttacher
                :post="postToAttach"
                :initialShouldExpand="true"
                @attachedPost="postToAttach = null"
            />
        </section>
    </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

import PostAttacher from "./PostAttacher";
import PostSearch from "@/js/commonComponents/Posts/PostSearch";

export default {
    name: "PostsAttacher",
    components: {
        PostAttacher,
        PostSearch
    },
    data() {
        return {
            postToAttach: null
        };
    },
    computed: {
        ...mapState("postsModule", ["posts", "links"]),
        ...mapGetters("postsModule", ["unattachedPosts"])
    },
    methods: {
        onPostClick(post) {
            if (
                this.postToAttach === null
                || this.postToAttach.id !== post.id
            ) {
                this.postToAttach = post;
            } else {
                this.postToAttach = null;
            }
        }
    }
};
</script>