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
                            :data-link-id="linkId"
                            @click="togglePostId(postId)"
                        >
                            <span
                                v-if="dataStore.posts[postId].title.length > 0"
                                class="font-bold"
                            >
                                {{ dataStore.posts[postId].title }}
                            </span>
                            <p
                                v-if="dataStore.posts[postId].body.length > 0"
                                class="text-xs"
                            >
                                {{ dataStore.posts[postId].body.substr(0, 200) }}{{ dataStore.posts[postId].body.length > 200 ? "..." : "" }}
                            </p>
                        </div>
                        <button
                            class="ml-2 py-1 px-2 btn btn--secondary"
                            title="remove link"
                            @click="dataStore.removeLink({id: linkId})"
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
                            :data-link-id="linkId"
                            @click="togglePostId(postId)"
                        >
                            <span
                                v-if="dataStore.posts[postId].title.length > 0"
                                class="font-bold"
                            >
                                {{ dataStore.posts[postId].title }}
                            </span>
                            <p
                                v-if="dataStore.posts[postId].body.length > 0"
                                class="text-xs"
                            >
                                {{ dataStore.posts[postId].body.substr(0, 200) }}{{ dataStore.posts[postId].body.length > 200 ? "..." : "" }}
                            </p>
                        </div>
                        <button
                            class="ml-2 py-1 px-2 btn btn--secondary"
                            title="remove link"
                            @click="dataStore.removeLink({id: linkId})"
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
import type {PostId} from "@/src/@types/StoreTypes";
import type {Post} from "@/src/store/models/Post";
import {useDataStore, useSettingsStore} from "@/src/store";

defineOptions({
    name: "LinkedPosts",
});

const props = defineProps<{
    post: Post;
}>();

///// refs and variables /////
const dataStore = useDataStore();
const settingsStore = useSettingsStore();

///// computed /////
const linkedPosts = computed(() => dataStore.postIdsThatLinkToPost(props.post.id));

///// functions /////
function togglePostId(postId: PostId): void {
    dataStore.togglePostId({
        id: postId,
        canOpenMultiplePosts: settingsStore.canOpenMultiplePosts
    });
}
</script>
