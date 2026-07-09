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

<script lang="ts">
import {defineComponent} from "vue";
import type {Post} from "@/src/store/models/Post";

import PostAttacher from "./PostAttacher.vue";
import PostSearch from "@/src/components/Posts/PostSearch.vue";
import {useDataStore} from "@/src/store";

export default defineComponent({
    name: "PostsAttacher",
    components: {
        PostAttacher,
        PostSearch
    },
    data() {
        return {
            postToAttach: null as Post | null
        };
    },
    computed: {
        unattachedPosts() {
            return useDataStore().unattachedPosts;
        }
    },
    methods: {
        onPostClick(post: Post) {
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
});
</script>
