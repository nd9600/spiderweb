<template>
    <section>
        <div
            v-if="!settingsStore.shouldAutosave"
            class="mb-8 flex justify-around"
        >
            <button
                class="btn btn--primary"
                @click="rootStore.saveStateToStorage"
            >
                Save
            </button>
        </div>

        <div class="flex justify-around items-start">
            <div class="w-1/2 flex flex-col items-start">
                <label class="mb-4">
                    <button
                        class="btn btn--secondary"
                        @click="clickFileInput"
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
    "schemaVersion": 2,
    "dataModule": {
        "posts": {},
        "links": {},
        "graphs": {
            "1": {
                "id": "1",
                "name": "default",
                "nodes": {},
                "nodePositions": {}
            }
        },
        "subgraphs": {
            "1": {
                "id": "1",
                "graph": "1",
                "name": "default",
                "nodes": {},
                "links": {},
                "colour": "#000000"
            }
        },
        "selectedPostIds": [],
        "selectedGraphId": "1",
        "selectedSubgraphIds": [],
        "zoom": {
            "x": 200,
            "y": 100,
            "scale": 0.5
        }
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

        <hr class="mt-10 mb-4">

        <BlogpostExporter />
    </section>
</template>

<script setup lang="ts">
///// imports /////
import {computed, ref, useTemplateRef} from "vue";
import type {ShouldTakeDataFrom} from "@/src/@types/StoreTypes";
import BlogpostExporter from "@/src/components/BlogpostExporter/BlogpostExporter.vue";
import {useRootStore, useSettingsStore} from "@/src/store";
import {parseImportedStorageObject} from "@/src/store/storage";

defineOptions({
    name: "LoadSave",
});

///// refs and variables /////
const rootStore = useRootStore();
const settingsStore = useSettingsStore();
const fileInput = useTemplateRef<HTMLInputElement>("fileInput");
const fileToImport = ref<Nullable<File>>(null);
const shouldImportData = ref(false);
const shouldImportSettings = ref(false);
const shouldTakeDataFrom = ref<Nullable<ShouldTakeDataFrom>>(null);

///// computed /////
const isAlreadySyncingWithFirebase = computed(() => settingsStore.remoteStorageMethod === "firebase");

const shouldShowTakeDataFromSelect = computed(() => {
    return shouldImportSettings.value
        && !isAlreadySyncingWithFirebase.value // if you're already syncing with Firebase, your local data and the data in Firebase will be the same, so you don't need to choose between them
        && !shouldImportData.value; // if you're importing data, you'll want to use it, not take data from Firebase
});

const fileToImportIsValid = computed(() => {
    if (fileToImport.value == null) {
        return false;
    }

    return fileToImport.value.type === "application/json";
});

const importButtonIsDisabled = computed(() => {
    return !fileToImportIsValid.value
        || (
            !shouldImportData.value && !shouldImportSettings.value
        )
        || (
            shouldShowTakeDataFromSelect.value
            && shouldTakeDataFrom.value === null
        );
});

///// functions /////
function clickFileInput(): void {
    fileInput.value?.click();
}

function onFileUpload(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const files = target?.files;
    if (files == null || files.length === 0 || files.length > 1) {
        return;
    }
    const file = files[0];
    if (file == null) {
        return;
    }
    fileToImport.value = file;
    if (file.type !== "application/json") {
        alert("You must upload a JSON file exported by the 'export' button");
    }
}

async function importState(): Promise<void> {
    if (fileToImport.value == null) {
        return;
    }

    const stateString = await fileToImport.value.text();
    let parsedState;
    try {
        parsedState = parseImportedStorageObject(JSON.parse(stateString));
    } catch (error) {
        console.log(error);
        alert("Imported file isn't valid");
        return;
    }

    if (shouldImportData.value) {
        await rootStore.importData(parsedState);
    }

    const willStartSyncingWithFirebaseAfterImport = parsedState.settingsModule?.remoteStorageMethod === "firebase";
    if (shouldImportSettings.value) {
        if (
            shouldShowTakeDataFromSelect.value
            && shouldTakeDataFrom.value !== null
            && willStartSyncingWithFirebaseAfterImport
        ) {
            await rootStore.importSettings({
                storageObject: parsedState,
                shouldTakeDataFrom: shouldTakeDataFrom.value
            });
        } else {
            await rootStore.importSettings({
                storageObject: parsedState,
                shouldTakeDataFrom: null
            });
        }
    }
    fileToImport.value = null;
    await rootStore.saveStateToStorage();
}

function exportState(): void {
    const blob = new Blob(
        [JSON.stringify(rootStore.storageObject)],
        {type: "application/json"}
    );
    const now = new Date().toISOString()
        .replace("T", "_")
        .replace("Z", "");

    downloadData(blob, `spiderwebExport-${now}.json`);
}

function downloadData(blob: Blob, filename: string): void {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";

    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}
</script>
