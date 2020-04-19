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
        <label>
            in the graph
            <select
                v-model.number="graphId"
                class="select select--secondary mb-2"
            >
                <option
                    v-for="(graph, id) in graphs"
                    :key="id"
                    :value="id"
                >
                    {{ graph.name }}
                </option>
            </select>
        </label>

        <p class="my-2">
            from
            <span
                v-if="!wantsToChangeSource"
                class="text-red"
            >
                {{ titleOrBody(source) }}
            </span>
            <post-search
                v-else
                class="ml-2"
                @clickedOnResult="onPostClick('source', $event)"
            />

            <button
                class="btn btn--secondary mt-2 ml-4"
                type="button"
                @click="wantsToChangeSource = !wantsToChangeSource"
            >
                {{ wantsToChangeSource ? "Cancel" : "Change" }}
            </button>
        </p>

        <p class="mb-2">
            →
            <span
                v-if="!wantsToChangeTarget"
                class="text-red"
            >
                {{ titleOrBody(target) }}
            </span>
            <post-search
                v-else
                class="ml-2"
                @clickedOnResult="onPostClick('target', $event)"
            />

            <button
                class="btn btn--secondary mt-2 ml-4"
                type="button"
                @click="wantsToChangeTarget = !wantsToChangeTarget"
            >
                {{ wantsToChangeTarget ? "Cancel" : "Change" }}
            </button>
        </p>

        <button
            class="btn btn--secondary py-1 px-2 block"
            @click="removeLinkLocal"
        > &#x1f5d1; remove link
        </button>
    </div>
</template>

<script>
import {mapState, mapGetters, mapMutations} from "vuex";
import moment from "moment";

import PostSearch from "@/js/commonComponents/Posts/PostSearch";

export default {
    name: "LinkEditor",
    components: {
        PostSearch
    },
    props: {
        link: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            graphId: this.link.graph,
            source: this.link.source,
            target: this.link.target,
            type: this.link.type,

            wantsToChangeSource: false,
            wantsToChangeTarget: false,
        };
    },
    computed: {
        ...mapState("postsModule", ["graphs", "posts", "selectedGraphNames"]),
        ...mapGetters("postsModule", ["postIds", "graphNames", "titleOrBody"]),

        possibleTargets() {
            return this.postIds.filter(id => id !== this.source);
        }
    },
    watch: {
        "graphId": "updateLinkLocal",
        "source": "updateLinkLocal",
        "target": "updateLinkLocal",
        "type": "updateLinkLocal",
    },
    methods: {
        ...mapMutations("postsModule", ["updateLink", "removeLink"]),

        onPostClick(sourceOrTarget, post) {
            if (sourceOrTarget === "source") {
                this.source = post.id;
                this.wantsToChangeSource = false;
            } else {
                this.target = post.id;
                this.wantsToChangeTarget = false;
            }
        },

        updateLinkLocal() {
            this.updateLink({
                id: this.link.id,
                graph: this.graphId,
                source: this.source,
                target: this.target,
                type: this.type,
                updated_at: moment().format()
            });
            this.$emit("updatedLink", this.link.id);
        },
        removeLinkLocal() {
            this.removeLink({
                id: this.link.id,
            });
            this.$emit("removedLink", this.link.id);
        }
    }
};
</script>