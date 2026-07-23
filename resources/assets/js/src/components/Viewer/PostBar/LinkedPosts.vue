<template>
    <section>
        <div class="flex justify-between items-center">
            <template v-if="linksToPost.length > 0">
                <div>
                    <div
                        v-for="linkedPost in linksToPost"
                        :key="linkedPost.linkId"
                        class="mb-4 flex justify-between items-start"
                    >
                        <div
                            class="p-1 cursor-pointer bg-red-200 hover:bg-red-300 rounded-lg text-xs md:text-sm"
                            title="view this post"
                            :data-link-id="linkedPost.linkId"
                            @click="togglePostId(linkedPost.post.id)"
                        >
                            <span
                                v-if="linkedPost.post.title.length > 0"
                                class="font-bold"
                            >
                                {{ linkedPost.post.title }}
                            </span>
                            <p
                                v-if="linkedPost.post.body.length > 0"
                                class="text-xs"
                            >
                                {{ linkedPost.post.body.substring(0, 200) }}{{ linkedPost.post.body.length > 200 ? "..." : "" }}
                            </p>
                        </div>
                        <button
                            class="ml-2 py-1 px-2 btn btn--secondary"
                            title="remove link"
                            @click="dataStore.removeLink({id: linkedPost.linkId})"
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
                {{ dataStore.titleOrBody(post.id) }}
            </span>

            <template v-if="linksFromPost.length > 0">
                <h4 class="h h--4 mx-4 flex flex-col">
                    <span>→</span>
                    <span>→</span>
                    <span>→</span>
                </h4>

                <div>
                    <div
                        v-for="linkedPost in linksFromPost"
                        :key="linkedPost.linkId"
                        class="mb-4 flex justify-between items-start"
                    >
                        <div
                            class="p-1 cursor-pointer bg-red-200 hover:bg-red-300 rounded-lg text-xs md:text-sm"
                            title="view this post"
                            :data-link-id="linkedPost.linkId"
                            @click="togglePostId(linkedPost.post.id)"
                        >
                            <span
                                v-if="linkedPost.post.title.length > 0"
                                class="font-bold"
                            >
                                {{ linkedPost.post.title }}
                            </span>
                            <p
                                v-if="linkedPost.post.body.length > 0"
                                class="text-xs"
                            >
                                {{ linkedPost.post.body.substring(0, 200) }}{{ linkedPost.post.body.length > 200 ? "..." : "" }}
                            </p>
                        </div>
                        <button
                            class="ml-2 py-1 px-2 btn btn--secondary"
                            title="remove link"
                            @click="dataStore.removeLink({id: linkedPost.linkId})"
                        >
                            x
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </section>
</template>

<script setup lang="ts">
///// imports /////
import {computed} from "vue";
import type {LinkId, PostId} from "@/src/@types/StoreTypes";
import type {Post} from "@/src/store/models/Post";
import type {LinkedPostIds} from "@/src/store/modules/dataModule";
import {useDataStore, useSettingsStore} from "@/src/store";

defineOptions({
    name: "LinkedPosts",
});

const props = defineProps<{
    post: Post;
}>();

interface LinkedPost {
    linkId: LinkId;
    post: Post;
}

///// refs and variables /////
const dataStore = useDataStore();
const settingsStore = useSettingsStore();
const emptyLinkedPostIds: LinkedPostIds = {
    from: {},
    to: {},
};

///// computed /////
const linkedPosts = computed(() => dataStore.linksByPostId[props.post.id] ?? emptyLinkedPostIds);
const linksToPost = computed(() => linkedPostEntries(linkedPosts.value.to));
const linksFromPost = computed(() => linkedPostEntries(linkedPosts.value.from));

///// functions /////
function linkedPostEntries(linkedPostIds: Record<LinkId, PostId>): LinkedPost[] {
    return Object.entries(linkedPostIds)
        .map(([linkId, postId]) => ({
            linkId,
            post: dataStore.posts[postId],
        }));
}

function togglePostId(postId: PostId): void {
    dataStore.togglePostId({
        id: postId,
        canOpenMultiplePosts: settingsStore.canOpenMultiplePosts
    });
}
</script>
