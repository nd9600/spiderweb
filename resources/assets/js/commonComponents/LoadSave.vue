<template>
    <section>
        <div class="flex justify-around">
            <button
                class="btn btn--primary"
                @click="saveStateToStorage"
            >
                Save
            </button>
        </div>

        <div class="mt-8 flex justify-around items-start">
            <div class="inline-block">
                <div
                    v-if="fileToImportIsValid"
                    class="flex flex-col items-start"
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

                    <label v-if="shouldImportSettings && !shouldImportData">
                        If changing storage method, take data from
                        <select
                            v-model="shouldTakeDataFrom"
                            class="p-2 rounded text-gray-700 bg-white"
                        >
                            <option value="local storage">
                                Local storage
                            </option>
                            <option value="firebase">
                                Firebase
                            </option>
                        </select>
                    </label>

                    <p>
                        <sub class="text-gray-500">
                            The file you're importing must be like this:
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
                "colour": "black"
            }
        },
        "selectedPostIds": [],
        "selectedGraphIds": []
    },
    "settingsModule": {
        "shouldAutosave": true,
        "storageMethod": "local",
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

                <label>
                    <button
                        class="btn btn--secondary"
                        @click="$refs.fileInput.click()"
                    >
                        Upload
                    </button>
                    <input
                        ref="fileInput"
                        type="file"
                        class="hidden"
                        accept="application/json"
                        @change="onFileUpload"
                    />
                </label>

                <button
                    class="btn btn--primary"
                    :disabled="!fileToImportIsValid || (!shouldImportData && !shouldImportSettings)"
                    @click="importState"
                >
                    Import
                </button>
            </div>
            <button
                class="btn btn--primary"
                @click="exportState"
            >
                Export
            </button>
        </div>
    </section>
</template>

<script>
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
    name: "LoadSave",
    data() {
        return {
            fileToImport: null,
            shouldImportData: false,
            shouldImportSettings: false,

            shouldTakeDataFrom: "local storage" // "local storage" | "firebase"
        };
    },
    computed: {
        ...mapGetters(["storageObject"]),

        fileToImportIsValid() {
            return this.fileToImport !== null
                && this.fileToImport.type === "application/json";
        }
    },
    methods: {
        ...mapActions(["saveStateToLocalStorage", "saveStateToStorage", "loadStateFromStorage", "importData", "importSettings"]),

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
                this.importData(parsedState);
            }
            if (this.shouldImportSettings) {
                if (!this.shouldImportData) { // if you're importing the data as well as the settings, you obviously want to use the imported data
                    this.importSettings({
                        storageObject: parsedState,
                        shouldTakeDataFrom: this.shouldTakeDataFrom
                    });
                } else {
                    this.importSettings({
                        storageObject: parsedState,
                        shouldTakeDataFrom: null
                    });
                }
            }
            this.fileToImport = null;
            this.saveStateToLocalStorage();
        },

        exportState() {
            const blob = new Blob(
                [JSON.stringify(this.storageObject)],
                {type: "application/json"}
            );
            const now = moment().format("Y-MM-DD_HH:mm:ss");

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

<style scoped>

</style>
