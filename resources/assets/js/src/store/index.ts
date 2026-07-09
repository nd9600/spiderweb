import {createPinia} from "pinia";

import {useClickerStore} from "./modules/clickerModule";
import {useDataStore} from "./modules/dataModule";
import {useFirebaseStore} from "./modules/firebaseModule";
import {useRootStore} from "./modules/rootStore";
import {useSettingsStore} from "./modules/settingsModule";
import {setFirebasePatchWriter} from "./remoteSync";
import {updateFirebaseStorage} from "./firebaseStorage";

export {useClickerStore, useDataStore, useFirebaseStore, useRootStore, useSettingsStore};

const pinia = createPinia();

setFirebasePatchWriter(async (patch) => {
    const settingsStore = useSettingsStore(pinia);
    if (settingsStore.remoteStorageMethod !== "firebase") {
        return;
    }

    await updateFirebaseStorage(useFirebaseStore(pinia).firebaseConfig, patch);
});

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
