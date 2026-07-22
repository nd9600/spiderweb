import debounce from "lodash/debounce";
import {defineStore} from "pinia";

import {
    parseImportedStorageObject,
    STORAGE_SCHEMA_VERSION,
    type ImportedStorageObject,
    type OfflineStorageObject
} from "../storage";
import {
    readFirebaseStorage,
    subscribeToFirebaseDataModule,
    writeFirebaseStorage,
} from "../firebaseStorage";
import {useDataModuleSyncStore} from "../dataModuleSync";
import {useDataStore} from "./dataModule";
import {useFirebaseStore} from "./firebaseModule";
import {useSettingsStore} from "./settingsModule";
import type {DataModuleState, FirebaseConfig, ShouldTakeDataFrom} from "@/src/@types/StoreTypes";
import {STORAGE_KEY} from "@/src/components/constants";

export type {ImportedStorageObject, OfflineStorageObject};

interface RootUiState {
    loadingApp: boolean;
    failedToLoadData: boolean;
    isRenderingGraph: boolean;
}

interface ImportSettingsPayload {
    storageObject: ImportedStorageObject;
    shouldTakeDataFrom: Nullable<ShouldTakeDataFrom>;
}

// Imports and remote listener updates touch several stores at once. Track nested suppression so none of
// those internal mutations trigger local autosave or Firebase patch writes while the batch is being applied.
let autosaveSuppressionDepth = 0;

// Firebase listeners live outside Pinia's lifecycle, so keep the unsubscribe callback here and replace it
// whenever the app reloads data or changes Firebase config.
let unsubscribeFromFirebase: Nullable<() => void> = null;

export function isAutosaveSuppressed(): boolean {
    return autosaveSuppressionDepth > 0;
}

export function runWithoutAutosave<T>(callback: () => T): T {
    autosaveSuppressionDepth += 1;
    try {
        return useDataModuleSyncStore().runWithoutRemoteWrites(callback);
    } finally {
        autosaveSuppressionDepth -= 1;
    }
}

const autosaveState = debounce(() => {
    const settingsStore = useSettingsStore();
    if (!settingsStore.shouldAutosave) {
        return;
    }

    // Pinia subscriptions keep the local/export backup current; Firebase writes are explicit domain patches now.
    useRootStore().saveStateToLocalStorage();
}, 250);

function parseStorageString(storageString: string): ImportedStorageObject {
    return parseImportedStorageObject(JSON.parse(storageString));
}

function stopFirebaseSync(): void {
    // Only one active Firebase subscription set should exist; otherwise every remote update is applied more than once.
    if (unsubscribeFromFirebase == null) {
        return;
    }

    unsubscribeFromFirebase();
    unsubscribeFromFirebase = null;
}

export const useRootStore = defineStore("root", {
    state: (): RootUiState => ({
        loadingApp: true,
        failedToLoadData: false,
        isRenderingGraph: false,
    }),
    getters: {
        storageObject(): OfflineStorageObject {
            const dataStore = useDataStore();
            const settingsStore = useSettingsStore();
            const firebaseStore = useFirebaseStore();

            return {
                schemaVersion: STORAGE_SCHEMA_VERSION,
                dataModule: dataStore.$state,
                settingsModule: settingsStore.$state,
                firebaseModule: firebaseStore.$state,
            };
        }
    },
    actions: {
        setLoadingApp(loadingApp: boolean) {
            this.loadingApp = loadingApp;
        },
        setFailedToLoadData(failedToLoadData: boolean) {
            this.failedToLoadData = failedToLoadData;
        },
        setIsRenderingGraph(isRenderingGraph: boolean) {
            this.isRenderingGraph = isRenderingGraph;
        },
        scheduleAutosave() {
            if (typeof localStorage === "undefined" || isAutosaveSuppressed()) {
                return;
            }

            autosaveState();
        },
        saveStateToLocalStorage() {
            const stringifiedStorage = JSON.stringify(this.storageObject);
            localStorage.setItem(STORAGE_KEY, stringifiedStorage);
            return stringifiedStorage;
        },
        async saveStateToStorage() {
            this.saveStateToLocalStorage();
            await this.saveStateToFirebase();
        },
        async saveStateToFirebase() {
            const settingsStore = useSettingsStore();
            if (settingsStore.remoteStorageMethod !== "firebase") {
                stopFirebaseSync();
                return;
            }

            const firebaseStore = useFirebaseStore();
            await writeFirebaseStorage(firebaseStore.firebaseConfig, useDataStore().$state);
            this.startFirebaseSync();
        },
        async loadStateFromStorage() {
            stopFirebaseSync();
            const localStorageItem = localStorage.getItem(STORAGE_KEY);
            if (localStorageItem === null) {
                this.setLoadingApp(false);
                return;
            }

            let localStorageObject: ImportedStorageObject;
            try {
                localStorageObject = parseStorageString(localStorageItem);
            } catch (error) {
                console.log(error);
                this.setFailedToLoadData(true);
                this.setLoadingApp(false);
                return;
            }

            const remoteStorageMethod = localStorageObject.settingsModule?.remoteStorageMethod;
            // Local storage still owns settings/Firebase config, even when the graph data is loaded from Firebase.
            await this.importState(localStorageObject);

            switch (remoteStorageMethod) {
                case "firebase": {
                    try {
                        const firebaseConfig = localStorageObject.firebaseModule?.firebaseConfig;
                        if (firebaseConfig == null) {
                            throw new Error("Firebase config missing");
                        }

                        await this.loadDataModuleFromFirebase(firebaseConfig);
                        this.startFirebaseSync();
                        this.setLoadingApp(false);
                    } catch (error) {
                        useSettingsStore().remoteStorageMethod = "none";
                        this.setLoadingApp(false);
                        alert(error);
                    }
                    break;
                }
                case "none":
                default: {
                    stopFirebaseSync();
                    this.setLoadingApp(false);
                    break;
                }
            }
        },
        async loadDataFrom(shouldTakeDataFrom: Nullable<ShouldTakeDataFrom>) {
            switch (shouldTakeDataFrom) {
                case "local": {
                    const localStorageItem = localStorage.getItem(STORAGE_KEY);
                    if (localStorageItem === null) {
                        return;
                    }

                    const localStorageObject = parseStorageString(localStorageItem);
                    await this.importData(localStorageObject);
                    break;
                }
                case "firebase": {
                    this.setLoadingApp(true);
                    try {
                        const firebaseStore = useFirebaseStore();
                        await this.loadDataModuleFromFirebase(firebaseStore.firebaseConfig);
                        this.startFirebaseSync();
                    } catch (error) {
                        console.log(error);
                        alert("There was an error loading the data from Firebase, please refresh the page/change your Firebase config in 'settings', and try again");
                    }
                    this.setLoadingApp(false);
                    break;
                }
                default:
                    break;
            }
        },
        async loadDataModuleFromFirebase(firebaseConfig: FirebaseConfig) {
            const firebaseStorageObject = await readFirebaseStorage(firebaseConfig);
            if (firebaseStorageObject == null) {
                // First structured save for an empty Firebase database: seed it from the current local data.
                await writeFirebaseStorage(firebaseConfig, useDataStore().$state);
                return;
            }

            if (typeof firebaseStorageObject === "string") {
                // Old Firebase storage was one JSON string at STORAGE_KEY. Load it once, then replace it with structured data.
                const legacyStorageObject = parseStorageString(firebaseStorageObject);
                await this.importData(legacyStorageObject);
                await writeFirebaseStorage(firebaseConfig, useDataStore().$state);
                return;
            }

            await this.importDataModule(firebaseStorageObject.dataModule);
        },
        startFirebaseSync() {
            // Restart from a clean subscription set because Firebase config/data source can change at runtime.
            stopFirebaseSync();
            const settingsStore = useSettingsStore();
            if (settingsStore.remoteStorageMethod !== "firebase") {
                return;
            }

            const firebaseStore = useFirebaseStore();
            // Each handler replaces one Pinia branch with the validated Firebase snapshot for that branch.
            // runWithoutAutosave prevents those remote snapshots from being written straight back to Firebase.
            unsubscribeFromFirebase = subscribeToFirebaseDataModule(firebaseStore.firebaseConfig, {
                posts(posts) {
                    runWithoutAutosave(() => {
                        useDataStore().posts = posts;
                    });
                },
                graphs(graphs) {
                    runWithoutAutosave(() => {
                        useDataStore().graphs = graphs;
                    });
                },
                links(links) {
                    runWithoutAutosave(() => {
                        useDataStore().links = links;
                    });
                },
                subgraphs(subgraphs) {
                    runWithoutAutosave(() => {
                        useDataStore().subgraphs = subgraphs;
                    });
                },
                selectedPostIds(selectedPostIds) {
                    runWithoutAutosave(() => {
                        useDataStore().selectedPostIds = selectedPostIds;
                    });
                },
                selectedGraphId(selectedGraphId) {
                    runWithoutAutosave(() => {
                        useDataStore().selectedGraphId = selectedGraphId;
                    });
                },
                selectedSubgraphIds(selectedSubgraphIds) {
                    runWithoutAutosave(() => {
                        useDataStore().selectedSubgraphIds = selectedSubgraphIds;
                    });
                },
                zoom(zoom) {
                    runWithoutAutosave(() => {
                        useDataStore().zoom = zoom;
                    });
                },
            });
        },
        async importState(storageObject: ImportedStorageObject) {
            const dataStore = useDataStore();
            const settingsStore = useSettingsStore();
            const firebaseStore = useFirebaseStore();

            runWithoutAutosave(() => {
                const importedData = storageObject.dataModule ?? storageObject.postsModule;
                if (importedData != null) {
                    dataStore.setState(importedData);
                }
                if (storageObject.settingsModule) {
                    settingsStore.setState(storageObject.settingsModule);
                }
                if (storageObject.firebaseModule) {
                    firebaseStore.setState(storageObject.firebaseModule);
                }
            });
        },
        async importData(storageObject: ImportedStorageObject) {
            const dataModule = storageObject.dataModule ?? storageObject.postsModule;
            if (dataModule != null) {
                await this.importDataModule(dataModule);
            }
        },
        async importDataModule(dataModule: DataModuleState) {
            runWithoutAutosave(() => {
                useDataStore().setState(dataModule);
            });
        },
        async importSettings({storageObject, shouldTakeDataFrom}: ImportSettingsPayload) {
            const settingsStore = useSettingsStore();
            const firebaseStore = useFirebaseStore();
            const isStorageMethodChanging = settingsStore.remoteStorageMethod !== storageObject.settingsModule?.remoteStorageMethod;

            runWithoutAutosave(() => {
                if (storageObject.settingsModule) {
                    settingsStore.setState(storageObject.settingsModule);
                }
                if (storageObject.firebaseModule) {
                    firebaseStore.setState(storageObject.firebaseModule);
                }
            });

            if (isStorageMethodChanging) {
                await this.loadDataFrom(shouldTakeDataFrom);
            }

            if (settingsStore.remoteStorageMethod !== "firebase") {
                stopFirebaseSync();
            }
        }
    }
});
