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
                            :disabled="storageObjectToImport?.dataModule == null && storageObjectToImport?.postsModule == null"
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
                        These settings change the Firebase connection. I want to
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
import {useFirebaseStore, useRootStore, useSettingsStore} from "@/src/store";
import {importChangesFirebaseStorage, parseImportedStorageObject, type ImportedStorageObject} from "@/src/store/storage";

defineOptions({
    name: "LoadSave",
});

///// refs and variables /////
const rootStore = useRootStore();
const settingsStore = useSettingsStore();
const firebaseStore = useFirebaseStore();
const fileInput = useTemplateRef<HTMLInputElement>("fileInput");
const fileToImport = ref<Nullable<File>>(null);
const storageObjectToImport = ref<Nullable<ImportedStorageObject>>(null);
const shouldImportData = ref(false);
const shouldImportSettings = ref(false);
const shouldTakeDataFrom = ref<Nullable<ShouldTakeDataFrom>>(null);

///// computed /////
const shouldShowTakeDataFromSelect = computed(() => {
    return shouldImportSettings.value
        && !shouldImportData.value
        && storageObjectToImport.value != null
        && importChangesFirebaseStorage(
            storageObjectToImport.value,
            settingsStore.remoteStorageMethod,
            firebaseStore.firebaseConfig
        );
});

const fileToImportIsValid = computed(() => storageObjectToImport.value != null);

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

async function onFileUpload(event: Event): Promise<void> {
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
    storageObjectToImport.value = null;
    shouldTakeDataFrom.value = null;
    try {
        const parsedState = parseImportedStorageObject(JSON.parse(await file.text()));
        if (fileToImport.value === file) {
            storageObjectToImport.value = parsedState;
            if (parsedState.dataModule == null && parsedState.postsModule == null) {
                shouldImportData.value = false;
            }
        }
    } catch (error) {
        if (fileToImport.value === file) {
            console.log(error);
            alert("Imported file isn't valid");
        }
    }
}

async function importState(): Promise<void> {
    const parsedState = storageObjectToImport.value;
    if (parsedState == null || importButtonIsDisabled.value) {
        return;
    }

    if (shouldImportSettings.value) {
        await rootStore.importSettings({
            storageObject: parsedState,
            shouldTakeDataFrom: shouldImportData.value ? "local" : shouldTakeDataFrom.value,
        });
    }
    if (shouldImportData.value) {
        await rootStore.importData(parsedState);
    }
    if (shouldImportData.value || shouldTakeDataFrom.value === "local") {
        await rootStore.saveStateToStorage();
    } else {
        // Loading a database or changing local settings does not require replacing the remote data.
        rootStore.saveStateToLocalStorage();
    }
    fileToImport.value = null;
    storageObjectToImport.value = null;
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
