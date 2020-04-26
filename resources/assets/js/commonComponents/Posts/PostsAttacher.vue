<template>
    <div>
        <section
            v-if="unattachedPosts.length > 0"
            class="w-full"
        >
            <h4
                class="h h--4"
                title="posts that aren't in any graph yet"
            >
                Posts that haven't been attached to any graph yet
            </h4>

            <PostAttacher
                v-for="post in unattachedPosts"
                :key="post.id"
                :post="post"
            />
        </section>
    </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import PostAttacher from "./PostAttacher";

export default {
    name: "PostsAttacher",
    components: {
        PostAttacher
    },
    computed: {
        ...mapState("postsModule", ["posts", "links"]),
        ...mapGetters("postsModule", ["unattachedPosts"])
    }
};
</script>