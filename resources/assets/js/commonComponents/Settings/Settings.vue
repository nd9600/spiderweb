<template>
    <section class="flex flex-col items-start">
        <label class="setting">
            Should autosave
            <input
                v-model="shouldAutosave"
                class="ml-4"
                type="checkbox"
            />
            <sub
                v-if="!shouldAutosave"
                class="text-gray-500"
            >
                (you'll need to press "save" in the "load/save" tab)
            </sub>
        </label>

        <label
            class="setting flex flex-col"
            :class="{
                'w-full md:w-1/2': storageMethod === 'firebase'
            }"
        >
            <div>
                Storage method
                <select
                    v-model="storageMethodInComponent"
                    class="ml-4 p-2 rounded text-gray-700 bg-white"
                >
                    <option value="local">Local</option>
                    <option value="firebase">Firebase</option>
                </select>

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
                        Changing storage method, take data from
                        <select
                            v-model="shouldTakeDataFrom"
                            class="p-2 rounded text-gray-700 bg-white"
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

            <template v-if="storageMethod === 'firebase'">
                <pre><textarea
                        v-model="firebaseConfig"
                        class="p-2 w-full h-48 rounded text-gray-800 placeholder-gray-600"
                        required="required"
                /></pre>
            </template>
        </label>

        <label class="setting">
            Can open multiple posts in the viewer
            <input
                v-model="canOpenMultiplePosts"
                class="ml-4"
                type="checkbox"
            />
        </label>

        <label class="setting">
            Graph and posts direction
            <select
                v-model="graphAndPostsDirection"
                class="p-2 rounded text-gray-700 bg-white"
            >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
            </select>
        </label>

        <label class="setting">
            Graph height
            <input
                v-model.number="graphHeight"
                class="ml-4 mb-2 p-2 rounded text-gray-800 text-base bg-gray-400"
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
            <sub class="ml-1 text-xs text-gray-500">vh</sub>
        </label>

        <label class="setting">
            Post-bar height
            <input
                v-model.number="postBarHeight"
                class="ml-4 mb-2 p-2 rounded text-gray-800 text-base bg-gray-400"
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
            <sub class="ml-1 text-xs text-gray-500">vh</sub>
        </label>

        <label class="setting">
            Post width
            <input
                v-model.number="postWidth"
                class="ml-4 mb-2 p-2 rounded text-gray-800 text-base bg-gray-400"
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
            <sub class="ml-1 text-xs text-gray-500">vw</sub>
        </label>
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
                this.setFirebaseConfig(JSON.parse(firebaseConfig));
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