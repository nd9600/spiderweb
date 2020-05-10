<template>
    <section class="flex flex-col items-start">
        <div class="setting">
            <label>
                Data
                <select
                    v-model="shouldAutosave"
                    class="text-red select"
                >
                    <option :value="true">
                        should
                    </option>
                    <option :value="false">
                        shouldn't
                    </option>
                </select>
                be saved automatically when something changes
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
                'w-full md:w-1/2': remoteStorageMethod === 'firebase'
            }"
        >
            <div class="flex flex-col items-start">
                <label>
                    Data
                    <select
                        v-model="remoteStorageMethodInComponent"
                        class="ml-4 text-red select"
                    >
                        <option value="none">shouldn't</option>
                        <option value="firebase">should</option>
                    </select>
                    be synced to <a
                        href="https://firebase.google.com/docs/database"
                        class="link"
                    >
                        Firebase's Realtime Database
                    </a>

                    <sub
                        v-if="remoteStorageMethodInComponent === 'firebase'"
                        class="ml-1 text-xs text-gray-500"
                    >
                        copy your Firebase config from <a
                            href="https://firebase.google.com/docs/web/setup?authuser=0#config-object"
                            class="link"
                            target="_blank"
                        >here</a>, it must be like
                        <pre class="inline bg-red-700 text-white p-1"><code>{"apiKey":"xyz",..}</code></pre>
                    </sub>
                </label>

                <div
                    v-if="remoteStorageMethodInComponent !== 'none'"
                    class="w-full flex flex-col items-start"
                >
                    <label
                        v-if="remoteStorageMethodInComponent !== remoteStorageMethod"
                    >
                        When I start syncing data with Firebase, I want to
                        <select
                            v-model="shouldTakeDataFrom"
                            class="text-red select"
                        >
                            <option
                                v-if="shouldTakeDataFrom === null"
                                :value="null"
                                disabled
                            >
                                [please choose an option]
                            </option>
                            <option value="local">
                                keep using the data that's been stored locally
                            </option>
                            <option value="firebase">
                                use any data that's already been stored in Firebase, and overwrite what I've stored locally
                            </option>
                        </select>
                    </label>

                    <pre
                        v-if="remoteStorageMethodInComponent === 'firebase'"
                        class="w-full"
                    ><label><textarea
                        v-model="firebaseConfigInComponent"
                        class="p-2 w-full h-48 rounded border text-gray-800 placeholder-gray-600"
                        required="required"
                    /></label></pre>

                    <p
                        v-if="!firebaseConfigIsValid"
                    >
                        Firebase config invalid, it should look like
                        <pre><code class="whitespace-pre-wrap bg-red-700 text-white p-1">{"apiKey":"xx","authDomain":"x.firebaseapp.com","databaseURL":"https://x.firebaseio.com","projectId":"spiderweb-e49bd","storageBucket":"x.appspot.com","messagingSenderId":"123","appId":"xyz"}</code></pre>
                    </p>
                </div>

                <button
                    v-if="remoteStorageMethodInComponent !== remoteStorageMethod"
                    class="btn btn--primary mt-2"
                    type="button"
                    :disabled="!canChangeStorageMethod"
                    @click="changeStorageMethod"
                >
                    Change storage method
                </button>
            </div>
        </div>

        <div class="setting">
            <label>
                When I already have a post open in the viewer, and I click on a second one, the second one should
                <select
                    v-model="canOpenMultiplePosts"
                    class="text-red select"
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
                The viewer should be oriented like this
                <select
                    v-model="graphAndPostsDirection"
                    class="mb-2 text-red select"
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
            remoteStorageMethodInComponent: "none", // "none" | "firebase"
            shouldTakeDataFrom: null, // "local" | "firebase",
            firebaseConfigInComponent: "",
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
        remoteStorageMethod() {
            return this.$store.state.settingsModule.remoteStorageMethod;
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

        firebaseConfigIsValid() {
            try {
                const firebaseConfig = JSON.parse(this.firebaseConfigInComponent);
                return typeof firebaseConfig === "object"
                    && typeof firebaseConfig.apiKey === "string"
                    && firebaseConfig.apiKey.trim() !== "";
            } catch (e) {
                return false;
            }
        },
        canChangeStorageMethod() {
            if (this.remoteStorageMethodInComponent !== "firebase") {
                return true;
            }
            if (this.shouldTakeDataFrom === null) {
                return false;
            }

            return this.firebaseConfigIsValid;
        }
    },
    created() {
        this.remoteStorageMethodInComponent = this.remoteStorageMethod;
        this.firebaseConfigInComponent = this.firebaseConfig;
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
            "setRemoteStorageMethod",
        ]),
        ...mapActions("firebaseModule", [
            "setFirebaseConfig"
        ]),

        async changeStorageMethod() {
            if (this.firebaseConfig !== this.firebaseConfigInComponent) {
                this.firebaseConfig = this.firebaseConfigInComponent;
            }
            await this.setRemoteStorageMethod({
                remoteStorageMethod: this.remoteStorageMethodInComponent,
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