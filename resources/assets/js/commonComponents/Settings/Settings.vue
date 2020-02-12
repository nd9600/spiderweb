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
                    v-model="storageMethod"
                    class="ml-4"
                >
                    <option value="local">Local</option>
                    <option value="firebase">Firebase</option>
                </select>

                <sub 
                    v-if="storageMethod === 'firebase'"
                    class="ml-1 text-xs text-gray-500"
                >
                    copy your Firebase config from <a
                        href="https://firebase.google.com/docs/web/setup?authuser=0#config-object"
                        class="link"
                        target="_blank"
                    >here</a>
                </sub>
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
    </section>
</template>

<script>
import {mapMutations} from "vuex";

export default {
    name: "Settings",
    computed: {
        shouldAutosave: {
            get() {
                return this.$store.state.settingsModule.shouldAutosave;
            },
            set(shouldAutosave) {
                this.setShouldAutosave(shouldAutosave);
            }
        },
        storageMethod: {
            get() {
                return this.$store.state.settingsModule.storageMethod;
            },
            set(storageMethod) {
                this.setStorageMethod(storageMethod);
            }
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
        }
    },
    methods: {
        ...mapMutations("settingsModule", [
            "setShouldAutosave",
            "setStorageMethod",
            "setCanOpenMultiplePosts",
            "setGraphHeight",
            "setPostBarHeight"
        ]),

        ...mapMutations("firebaseModule", [
            "setFirebaseConfig"
        ]),
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