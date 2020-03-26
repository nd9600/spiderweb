<template>
    <section class="flex flex-col items-start">
        <div class="setting">
            <label>
                <select
                    v-model="shouldAutosave"
                    class="p-2 rounded text-red bg-white"
                >
                    <option :value="true">
                        Should
                    </option>
                    <option :value="false">
                        Shouldn't
                    </option>
                </select>
                autosave data
            </label>
            <sub
                v-if="!shouldAutosave"
                class="text-gray-500"
            >
                (you'll need to press "save" in the "load/save" tab)
            </sub>
        </div>

        <div
            class="setting flex flex-col"
            :class="{
                'w-full md:w-1/2': storageMethod === 'firebase'
            }"
        >
            <div>
                <label>
                    Data should be stored using
                    <select
                        v-model="storageMethodInComponent"
                        class="ml-4 p-2 rounded text-red bg-white"
                    >
                        <option value="local">Local storage</option>
                        <option value="firebase">Firebase</option>
                    </select>
                </label>

                <sub 
                    v-if="storageMethodInComponent === 'firebase'"
                    class="ml-1 text-xs text-gray-500"
                >
                    copy your Firebase config from <a
                        href="https://firebase.google.com/docs/web/setup?authuser=0#config-object"
                        class="link"
                        target="_blank"
                    >here</a>, it must be like <pre class="inline bg-red-700 text-white p-1">{"apiKey":"xyz",..}</pre>
                </sub>

                <div
                    v-if="storageMethodInComponent !== storageMethod"
                    class="flex flex-col items-start"
                >
                    <label>
                        When I change from storing data using <span class="italic">{{ storageMethod === "local" ? "Local storage" : "Firebase" }}</span> to <span class="italic">{{ storageMethodInComponent === "local" ? "Local storage" : "Firebase" }}</span>, data should be taken from
                        <select
                            v-model="shouldTakeDataFrom"
                            class="p-2 rounded text-red bg-white"
                        >
                            <option value="local">
                                Local storage
                            </option>
                            <option value="firebase">
                                Firebase
                            </option>
                        </select>
                    </label>

                    <button
                        class="btn btn--primary"
                        @click="changeStorageMethod"
                    >
                        Change storage method
                    </button>
                </div>
            </div>

            <template v-if="storageMethodInComponent === 'firebase'">
                <pre><textarea
                        v-model="firebaseConfig"
                        class="p-2 w-full h-48 rounded text-gray-800 placeholder-gray-600"
                        required="required"
                /></pre>
            </template>
        </div>

        <div class="setting">
            <label>
                When I already have a post open in the viewer, and I click on a second one, the second one should
                <select
                    v-model="canOpenMultiplePosts"
                    class="p-2 rounded text-red bg-white"
                >
                    <option :value="true">
                        be opened as well
                    </option>
                    <option :value="false">
                        replace the already-open one
                    </option>
                </select>
            </label>
        </div>

        <div class="setting">
            <label class="block">
                <select
                    v-model="graphAndPostsDirection"
                    class="mb-2 p-2 rounded text-gray-700 bg-white"
                >
                    <option value="horizontal">→</option>
                    <option value="vertical">↓</option>
                </select>
            </label>

            <label class="block">
                The graph should take up
                <input
                    v-model.number="graphHeight"
                    class="ml-4 mb-2 p-2 w-16  rounded text-gray-800 text-base bg-gray-400"
                    type="number"
                    inputmode="numeric"
                    pattern="^[1-9][0-9]?$|^100$"
                    size="3"
                    minlength="1"
                    maxlength="3"
                    min="1"
                    max="100"
                    step="1"
                />
                % of the browser window's height
            </label>

            <label class="block">
                The post-bar should take up
                <input
                    v-model.number="postBarHeight"
                    class="ml-4 mb-2 p-2 w-16  rounded text-gray-800 text-base bg-gray-400"
                    type="number"
                    inputmode="numeric"
                    pattern="^[1-9][0-9]?$|^100$"
                    size="3"
                    minlength="1"
                    maxlength="3"
                    min="1"
                    max="100"
                    step="1"
                />
                % of the browser window's height
            </label>

            <label class="block">
                Each post should take up at least
                <input
                    v-model.number="postWidth"
                    class="ml-4 mb-2 p-2 w-16 rounded text-gray-800 text-base bg-gray-400"
                    type="number"
                    inputmode="numeric"
                    pattern="^[1-9][0-9]?$|^100$"
                    size="3"
                    minlength="1"
                    maxlength="3"
                    min="1"
                    max="100"
                    step="1"
                />
                % of the browser window's width
            </label>

            <div
                class="p-1 h-64 w-64 flex overflow-auto border border-solid border-gray-600"
                :class="graphAndPostsDirection === 'horizontal' ? 'flex-row' : 'flex-col'"
            >
                <div
                    class="p-1 w-full border border-solid border-gray-600"
                    :style="{
                        'min-height': graphHeight + '%'
                    }"
                >
                    Graph
                </div>
                <div
                    class="p-1 w-full border border-solid border-gray-600 flex items-start overflow-x-auto"
                    :class="{
                        'mt-1': graphAndPostsDirection === 'vertical',
                        'ml-1': graphAndPostsDirection === 'horizontal',
                    }"
                    :style="{
                        'min-height': postBarHeight + '%'
                    }"
                >
                    <div
                        class="mt-1 mr-1 mb-1 p-1 border border-solid border-gray-600 text-xs"
                        :style="{
                            'min-width': postWidth + '%'
                        }"
                    >
                        Post
                    </div>
                    <div
                        class="m-1 p-1 border border-solid border-gray-600 text-xs"
                        :style="{
                            'min-width': postWidth + '%'
                        }"
                    >
                        Post
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import {mapMutations, mapActions} from "vuex";

export default {
    name: "Settings",
    data() {
        return {
            storageMethodInComponent: "local",
            shouldTakeDataFrom: "local" // "local" | "firebase"
        };
    },
    computed: {
        shouldAutosave: {
            get() {
                return this.$store.state.settingsModule.shouldAutosave;
            },
            set(shouldAutosave) {
                this.setShouldAutosave(shouldAutosave);
            }
        },
        storageMethod() {
            return this.$store.state.settingsModule.storageMethod;
        },
        firebaseConfig: {
            get() {
                return JSON.stringify(this.$store.state.firebaseModule.firebaseConfig);
            },
            set(firebaseConfig) {
                try {
                    this.setFirebaseConfig(JSON.parse(firebaseConfig));
                } catch (error) {
                    alert("Firebase config isn't formatted correctly, it should be like this: {\"apiKey\":\"xx\",\"authDomain\":\"x.firebaseapp.com\",\"databaseURL\":\"https://x.firebaseio.com\",\"projectId\":\"spiderweb-e49bd\",\"storageBucket\":\"x.appspot.com\",\"messagingSenderId\":\"123\",\"appId\":\"xyz\"}");
                }
            }
        },

        canOpenMultiplePosts: {
            get() {
                return this.$store.state.settingsModule.canOpenMultiplePosts;
            },
            set(canOpenMultiplePosts) {
                this.setCanOpenMultiplePosts(canOpenMultiplePosts);
            }
        },

        graphAndPostsDirection: {
            get() {
                return this.$store.state.settingsModule.graphAndPostsDirection;
            },
            set(graphAndPostsDirection) {
                this.setGraphAndPostsDirection(graphAndPostsDirection);
            }
        },

        graphHeight: {
            get() {
                return this.$store.state.settingsModule.graphHeight;
            },
            set(graphHeight) {
                this.setGraphHeight(graphHeight);
            }
        },
        postBarHeight: {
            get() {
                return this.$store.state.settingsModule.postBarHeight;
            },
            set(postBarHeight) {
                this.setPostBarHeight(postBarHeight);
            }
        },
        postWidth: {
            get() {
                return this.$store.state.settingsModule.postWidth;
            },
            set(postWidth) {
                this.setPostWidth(postWidth);
            }
        },
    },
    created() {
        this.storageMethodInComponent = this.storageMethod;
    },
    methods: {
        ...mapMutations("settingsModule", [
            "setShouldAutosave",
            "setCanOpenMultiplePosts",
            "setGraphAndPostsDirection",
            "setGraphHeight",
            "setPostBarHeight",
            "setPostWidth"
        ]),
        ...mapActions("settingsModule", [
            "setStorageMethod",
        ]),
        ...mapActions("firebaseModule", [
            "setFirebaseConfig"
        ]),

        changeStorageMethod() {
            this.setStorageMethod({
                storageMethod: this.storageMethodInComponent,
                shouldTakeDataFrom: this.shouldTakeDataFrom
            });
        }
    }
};
</script>

<style scoped>
.setting {
    padding: 1rem 2rem;

    background-color: white;
    border-radius: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.setting:not(:last-of-type) {
    margin-bottom: 2rem;
}
</style>