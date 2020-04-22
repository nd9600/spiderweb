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

            <UnattachedPost
                v-for="post in unattachedPosts"
                :key="post.id"
                :post="post"
            />
        </section>
    </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import UnattachedPost from "./UnattachedPost";

export default {
    name: "PostAttacher",
    components: {
        UnattachedPost
    },
    computed: {
        ...mapState("postsModule", ["posts", "links"]),
        ...mapGetters("postsModule", ["unattachedPosts"])
    }
};
</script>