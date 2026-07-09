<template>
    <div>
        <label>
            The link is a
            <select
                v-model="type"
                class="select select--secondary mb-2"
            >
                <option value="reply">
                    reply
                </option>
                <option value="sidenote">
                    sidenote
                </option>
                <option value="link">
                    link
                </option>
            </select>
        </label>
        <label v-if="Object.keys(subgraphs).length > 0">
            in the subgraphs ({{ subgraphsLinkIsIn.length }})
            <select
                v-model="subgraphsLinkIsIn"
                class="select select--secondary mb-2"
                multiple
                :size="Math.min(Object.keys(subgraphs).length, 3)"
            >
                <option
                    v-for="(subgraph, id) in subgraphs"
                    :key="id"
                    :value="id"
                >
                    {{ subgraph.name }}
                </option>
            </select>
        </label>

        <p class="mt-2 mb-6">
            from
            <span
                v-if="!wantsToChangeSource"
                class="text-red"
            >
                {{ titleOrBody(source) }}
            </span>
            <PostSearch
                v-else
                class="ml-2"
                @clickedOnResult="onPostClick('source', $event)"
            />
            <span :class="wantsToChangeSource ? 'block' : ''">
                <sub
                    v-if="wantsToChangeSource"
                    class="my-2 text-xs text-gray-500"
                >
                    search for a post's title/body, or click on a post
                </sub>

                <button
                    class="btn btn--secondary mt-2 ml-4"
                    type="button"
                    @click="wantsToChangeSource = !wantsToChangeSource"
                >
                    {{ wantsToChangeSource ? "Cancel" : "Change" }}
                </button>
            </span>
        </p>

        <hr>

        <p class="mt-6 mb-10">
            to
            <span
                v-if="!wantsToChangeTarget"
                class="text-red"
            >
                {{ titleOrBody(target) }}
            </span>
            <PostSearch
                v-else
                class="ml-2"
                @clickedOnResult="onPostClick('target', $event)"
            />

            <span :class="wantsToChangeTarget ? 'block' : ''">
                <sub
                    v-if="wantsToChangeTarget"
                    class="my-2 text-xs text-gray-500"
                >
                    search for a post's title/body, or click on a post
                </sub>

                <button
                    class="btn btn--secondary mt-2 ml-4"
                    type="button"
                    @click="wantsToChangeTarget = !wantsToChangeTarget"
                >
                    {{ wantsToChangeTarget ? "Cancel" : "Change" }}
                </button>
            </span>
        </p>

        <button
            class="btn btn--secondary mb-4 py-1 px-2 block"
            @click="removeLinkLocal"
        >
            &#x1f5d1; remove link
        </button>
    </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";
import type {LinkType, PostId, SubgraphId} from "@/src/@types/StoreTypes";
import type {LinkSerialised} from "@/src/store/classes/Link";
import PostSearch from "@/src/components/Posts/PostSearch.vue";
import {useClickerStore, useDataStore} from "@/src/store";

export default defineComponent({
    name: "LinkEditor",
    emits: ["updatedLink", "removedLink"],
    components: {
        PostSearch
    },
    props: {
        link: {
            type: Object as PropType<LinkSerialised>,
            required: true,
        }
    },
    data() {
        return {
            source: this.link.source as PostId,
            target: this.link.target as PostId,
            type: this.link.type as LinkType,
        };
    },
    computed: {
        subgraphs() {
            return useDataStore().subgraphs;
        },
        titleOrBody() {
            return (postId: string) => useDataStore().titleOrBody(postId);
        },

        subgraphsLinkIsIn: {
            get() {
                return Object.values(useDataStore().subgraphs)
                    .filter((subgraph) => subgraph.links.includes(this.link.id))
                    .map((subgraph) => subgraph.id);
            },
            set(subgraphsLinkIsIn: SubgraphId[]) {
                useDataStore().setSubgraphsLinkIsIn({linkId: this.link.id, subgraphsLinkIsIn});
            }
        },

        wantsToChangeSource: {
            get() {
                return useClickerStore().wantsToChangeSource;
            },
            set(wantsToChangeSource: boolean) {
                useClickerStore().setWantsToChangeSource(wantsToChangeSource);
            }
        },
        wantsToChangeTarget: {
            get() {
                return useClickerStore().wantsToChangeTarget;
            },
            set(wantsToChangeTarget: boolean) {
                useClickerStore().setWantsToChangeTarget(wantsToChangeTarget);
            }
        }
    },
    watch: {
        // fixme: fix this bug
        // link(link) {
        //     this.graphId = link.graph;
        //     this.source = link.source;
        //     this.target = link.target;
        //     this.type = link.type;
        // },
        "subgraphId": "updateLinkLocal",
        "source": "updateLinkLocal",
        "target": "updateLinkLocal",
        "type": "updateLinkLocal",
    },
    methods: {
        onPostClick(sourceOrTarget: "source" | "target", post: {id: PostId}) {
            if (sourceOrTarget === "source") {
                this.source = post.id;
                this.wantsToChangeSource = false;
            } else {
                this.target = post.id;
                this.wantsToChangeTarget = false;
            }
        },

        updateLinkLocal() {
            useDataStore().updateLink({
                id: this.link.id,
                graph: this.link.graph,
                source: this.source,
                target: this.target,
                type: this.type
            });
            this.$emit("updatedLink", this.link.id);
        },
        removeLinkLocal() {
            useDataStore().removeLink({
                id: this.link.id,
            });
            this.$emit("removedLink", this.link.id);
        }
    }
});
</script>
