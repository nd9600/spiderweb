<template>
    <section>
        <div
            v-if="!shouldAutosave"
            class="mb-8 flex justify-around"
        >
            <button
                class="btn btn--primary"
                @click="saveStateToStorage"
            >
                Save
            </button>
        </div>

        <div class="flex justify-around items-start">
            <div class="w-1/2 flex flex-col items-start">
                <label class="mb-4">
                    <button
                        class="btn btn--secondary"
                        @click="$refs.fileInput.click()"
                    >
                        Upload a data/settings file that's been previously exported
                    </button>
                    <input
                        ref="fileInput"
                        type="file"
                        class="hidden"
                        accept="application/json"
                        @change="onFileUpload"
                    />
                </label>

                <div
                    v-if="fileToImportIsValid"
                    class="mb-4 flex flex-col items-start"
                >
                    <label>
                        Import data
                        <input
                            v-model="shouldImportData"
                            class="ml-4"
                            type="checkbox"
                        />
                    </label>

                    <label>
                        Import settings
                        <input
                            v-model="shouldImportSettings"
                            class="ml-4"
                            type="checkbox"
                        />
                    </label>

                    <p>
                        <sub
                            v-if="!shouldImportData && !shouldImportSettings"
                            class="text-gray-500"
                        >
                            (you need to import data and/or settings)
                        </sub>
                    </p>

                    <label
                        v-if="shouldShowTakeDataFromSelect"
                        class="mt-2 pt-2 border-t border-r-0 border-b-0 border-l-0 border-gray-400"
                    >
                        If the settings I'm importing will start syncing data with Firebase,
                        <select
                            ref="shouldTakeDataFromSelect"
                            v-model="shouldTakeDataFrom"
                            class="select text-red"
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

                    <p>
                        <sub class="text-gray-500">
                            The file you're importing must look like this:
                        </sub>
                    </p>

                    <pre
                        class="overflow-y-auto"
                        style="max-height: 33vh"
                    ><code>{
    "postsModule": {
        "posts": {},
        "links": {},
        "graphs": {
            "1": {
                "id": 1,
                "name": "default",
                "nodes": [],
                "subgraphs": []
            }
        },
        "subgraphs": {
            "1": {
                "id": 1,
                "name": "default",
                "nodes": [],
                "links": [],
                "colour": "black"
            }
        },
        "selectedPostIds": [],
        "selectedGraphId": 1,
        "selectedSubgraphIds": []
    },
    "settingsModule": {
        "shouldAutosave": true,
        "remoteStorageMethod": "firebase",
        "canOpenMultiplePosts": true,
        "graphHeight": 66,
        "postBarHeight": 66
    },
    "firebaseModule": {
        "firebaseConfig": {
            "apiKey": "x",
            "authDomain": "y",
            "databaseURL": "z",
            "projectId": "xy",
            "storageBucket": "yz",
            "messagingSenderId": "xyz",
            "appId": "xx"
        }
    }
}</code></pre>
                </div>

                <button
                    class="btn btn--primary"
                    :disabled="importButtonIsDisabled"
                    @click="importState"
                >
                    Import the uploaded file
                </button>
                <sub
                    v-if="fileToImport !== null && (!fileToImportIsValid || (!shouldImportData && !shouldImportSettings))"
                    class="my-2 text-xs text-gray-500"
                >
                    {{ !fileToImportIsValid ? 'the file you\'ve uploaded isn\'t valid' : ((!shouldImportData && !shouldImportSettings) ? 'you must click one of the \'import\' buttons above' : '') }}
                </sub>
            </div>
            <div class="w-1/2 flex justify-end">
                <button
                    class="btn btn--primary"
                    @click="exportState"
                >
                    Export data and settings
                </button>
            </div>
        </div>
    </section>
</template>

<script>
import {mapState, mapGetters, mapActions} from "vuex";

export default {
    name: "LoadSave",
    data() {
        return {
            fileToImport: null,
            shouldImportData: false,
            shouldImportSettings: false,

            shouldTakeDataFrom: null, // "local" | "firebase"
        };
    },
    computed: {
        ...mapState("settingsModule", ["shouldAutosave"]),

        ...mapGetters(["storageObject"]),

        isAlreadySyncingWithFirebase() {
            return this.$store.state.settingsModule.remoteStorageMethod === "firebase";
        },
        shouldShowTakeDataFromSelect() {
            return this.shouldImportSettings
                && !this.isAlreadySyncingWithFirebase // if you're already syncing with Firebase, your local data and the data in Firebase will be the same, so you don't need to choose between them
                && !this.shouldImportData; // if you're importing data, you'll want to use it, not take data from Firebase
        },

        fileToImportIsValid() {
            return this.fileToImport !== null
                && this.fileToImport.type === "application/json";
        },
        importButtonIsDisabled() {
            return !this.fileToImportIsValid
                || (
                    !this.shouldImportData && !this.shouldImportSettings
                )
                || (
                    this.shouldShowTakeDataFromSelect
                    && this.shouldTakeDataFrom === null
                );
        }
    },
    methods: {
        ...mapActions(["saveStateToStorage", "loadStateFromStorage", "importData", "importSettings"]),

        onFileUpload(event) {
            const files = event.target.files || event.dataTransfer.files;
            if (!files.length || files.length > 1) {
                return;
            }
            const file = files[0];
            this.fileToImport = files[0];
            if (file.type !== "application/json") {
                alert("You must upload a JSON file exported by the 'export' button");
                return;
            }
        },
        async importState() {
            const stateString = await this.fileToImport.text();
            const parsedState = JSON.parse(stateString);

            if (
                !("postsModule" in parsedState)
                || !("settingsModule" in parsedState)
                || !("firebaseModule" in parsedState)
            ) {
                alert("Imported file isn't valid");
                return;
            }

            if (this.shouldImportData) {
                await this.importData(parsedState);
            }

            const willStartSyncingWithFirebaseAfterImport = parsedState.settingsModule.remoteStorageMethod && parsedState.settingsModule.remoteStorageMethod === "firebase";
            if (this.shouldImportSettings) {
                if (
                    this.shouldShowTakeDataFromSelect
                    && this.shouldTakeDataFrom !== null
                    && willStartSyncingWithFirebaseAfterImport
                ) {
                    await this.importSettings({
                        storageObject: parsedState,
                        shouldTakeDataFrom: this.shouldTakeDataFrom
                    });
                } else {
                    await this.importSettings({
                        storageObject: parsedState,
                        shouldTakeDataFrom: null
                    });
                }
            }
            this.fileToImport = null;
            await this.saveStateToStorage();
        },

        exportState() {
            const blob = new Blob(
                [JSON.stringify(this.storageObject)],
                {type: "application/json"}
            );
            const now = new Date().toISOString()
                .replace("T", "_")
                .replace("Z", "");

            this.downloadData(blob, `spiderwebExport-${now}.json`);
        },
        downloadData(blob, filename) {
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";

            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        }
    }
};
</script>