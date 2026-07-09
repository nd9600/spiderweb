import debounce from "lodash/debounce";
import {get, ref, set} from "firebase/database";
import {defineStore} from "pinia";

import {STORAGE_KEY} from "@/src/components/constants";
import firebaseDbFactory from "../firebaseDbFactory";
import {
    parseImportedStorageObject,
    STORAGE_SCHEMA_VERSION,
    type ImportedStorageObject,
    type OfflineStorageObject
} from "../storage";
import {useDataStore} from "./dataModule";
import {useFirebaseStore} from "./firebaseModule";
import {useSettingsStore} from "./settingsModule";
import type {ShouldTakeDataFrom} from "@/src/@types/StoreTypes";

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

let autosaveSuppressionDepth = 0;

export function isAutosaveSuppressed(): boolean {
    return autosaveSuppressionDepth > 0;
}

export function runWithoutAutosave<T>(callback: () => T): T {
    autosaveSuppressionDepth += 1;
    try {
        return callback();
    } finally {
        autosaveSuppressionDepth -= 1;
    }
}

const saveToFirebase = debounce(
    (stringifiedStorage: string) => {
        const settingsStore = useSettingsStore();
        if (settingsStore.remoteStorageMethod !== "firebase") {
            return;
        }

        const firebaseStore = useFirebaseStore();
        const firebaseDB = firebaseDbFactory(firebaseStore.firebaseConfig);
        void set(ref(firebaseDB, STORAGE_KEY), stringifiedStorage);
    },
    250,
    {
        leading: false,
        trailing: true,
    }
);

const autosaveState = debounce(() => {
    const settingsStore = useSettingsStore();
    if (!settingsStore.shouldAutosave) {
        return;
    }

    void useRootStore().saveStateToStorage();
}, 250);

function parseStorageString(storageString: string): ImportedStorageObject {
    return parseImportedStorageObject(JSON.parse(storageString));
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
        saveStateToStorage() {
            const stringifiedStorage = this.saveStateToLocalStorage();
            saveToFirebase(stringifiedStorage);
        },
        async loadStateFromStorage() {
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

            switch (remoteStorageMethod) {
                case "firebase": {
                    try {
                        let loadedDataSuccesfully = false;
                        const firebaseConfig = localStorageObject.firebaseModule?.firebaseConfig;
                        if (firebaseConfig == null) {
                            throw new Error("Firebase config missing");
                        }

                        const firebaseDB = firebaseDbFactory(firebaseConfig);
                        get(ref(firebaseDB, STORAGE_KEY))
                            .then((snapshot) => {
                                const value = snapshot.val() as Nullable<string>;
                                if (value == null) {
                                    this.setFailedToLoadData(true);
                                    return;
                                }

                                const firebaseStorageObject = parseStorageString(value);
                                void this.importState(firebaseStorageObject);
                                loadedDataSuccesfully = true;
                                this.setLoadingApp(false);
                            })
                            .catch((error: unknown) => {
                                console.log(error);
                                alert("There was an error loading the state from Firebase, please refresh the page/change your Firebase config in 'settings', and try again");
                            });

                        setTimeout(
                            () => {
                                if (!loadedDataSuccesfully) {
                                    this.setFailedToLoadData(true);
                                }
                            },
                            10000
                        );
                    } catch (error) {
                        useSettingsStore().remoteStorageMethod = "none";
                        this.setLoadingApp(false);
                        alert(error);
                    }
                    break;
                }
                case "none":
                default: {
                    await this.importState(localStorageObject);
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
                        const firebaseDB = firebaseDbFactory(firebaseStore.firebaseConfig);
                        const firebaseSnapshot = await get(ref(firebaseDB, STORAGE_KEY));
                        const firebaseStorageObject = parseStorageString(firebaseSnapshot.val() as string);
                        await this.importData(firebaseStorageObject);
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
                runWithoutAutosave(() => {
                    useDataStore().setState(dataModule);
                });
            }
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
        }
    }
});
