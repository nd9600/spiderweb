import {createPinia} from "pinia";

import {useClickerStore} from "./modules/clickerModule";
import {useDataStore} from "./modules/dataModule";
import {useFirebaseStore} from "./modules/firebaseModule";
import {useRootStore} from "./modules/rootStore";
import {useSettingsStore} from "./modules/settingsModule";
import {useDataModuleSyncStore} from "./dataModuleSync";

export {useClickerStore, useDataModuleSyncStore, useDataStore, useFirebaseStore, useRootStore, useSettingsStore};

const pinia = createPinia();

const rootStore = useRootStore(pinia);
for (const store of [
    useDataStore(pinia),
    useSettingsStore(pinia),
    useFirebaseStore(pinia),
]) {
    store.$subscribe(
        () => {
            rootStore.scheduleAutosave();
        },
        {
            detached: true,
            flush: "sync",
        }
    );
}

export default pinia;
