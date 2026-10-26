import {createPinia, setActivePinia} from "pinia";

import {STORAGE_KEY} from "@/src/components/constants";
import {readFirebaseStorage, subscribeToFirebaseDataModule, updateFirebaseStorage, writeFirebaseStorage} from "@/src/store/firebaseStorage";
import {useDataStore} from "@/src/store/modules/dataModule";
import {useRootStore} from "@/src/store/modules/rootStore";
import {useSettingsStore} from "@/src/store/modules/settingsModule";
import {useFirebaseStore} from "@/src/store/modules/firebaseModule";
import {createPost} from "@/src/store/models/Post";
import overallState from "./state";

vi.mock("@/src/store/firebaseStorage", () => ({
    readFirebaseStorage: vi.fn(),
    writeFirebaseStorage: vi.fn(),
    updateFirebaseStorage: vi.fn(),
    subscribeToFirebaseDataModule: vi.fn(() => vi.fn()),
}));

beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", {setItem: vi.fn()});
});

test.each(["none", "firebase"] as const)("a failed Firebase read restores the previous %s configuration without overwriting remote data", async (previousStorageMethod) => {
    vi.stubGlobal("alert", vi.fn());
    const error = new Error("Read failed");
    useSettingsStore().remoteStorageMethod = previousStorageMethod;
    const previousFirebaseConfig = {...useFirebaseStore().firebaseConfig};
    vi.mocked(readFirebaseStorage).mockRejectedValueOnce(error);

    await expect(useSettingsStore().setRemoteStorageMethod({
        remoteStorageMethod: "firebase",
        shouldTakeDataFrom: "firebase",
        firebaseConfig: {...previousFirebaseConfig, apiKey: "new-key"},
    })).rejects.toThrow("Read failed");

    expect(writeFirebaseStorage).not.toHaveBeenCalled();
    expect(useSettingsStore().remoteStorageMethod).toBe(previousStorageMethod);
    expect(useFirebaseStore().firebaseConfig).toEqual(previousFirebaseConfig);
    expect(useRootStore().loadingApp).toBe(false);
});

afterEach(async () => {
    useSettingsStore().remoteStorageMethod = "none";
    await useRootStore().saveStateToFirebase();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

test.each([true, false])("remote changes refresh the local backup when autosave is %s", (shouldAutosave) => {
    const root = useRootStore();
    const settings = useSettingsStore();
    settings.remoteStorageMethod = "firebase";
    settings.shouldAutosave = shouldAutosave;
    root.startFirebaseSync();
    const handlers = vi.mocked(subscribeToFirebaseDataModule).mock.calls[0][1];
    const post = createPost("1", "Remote post", "Body", "2026-01-01", "2026-01-01");

    handlers.posts({"1": post});
    vi.advanceTimersByTime(250);

    expect(useDataStore().posts["1"]).toEqual(post);
    expect(localStorage.setItem).toHaveBeenCalledTimes(shouldAutosave ? 1 : 0);
    if (shouldAutosave) {
        expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(root.storageObject));
    }
    expect(updateFirebaseStorage).not.toHaveBeenCalled();
});

test("saving Firebase config and enabling sync loads the chosen database without reloading local settings", async () => {
    const config = {...overallState.firebaseModule.firebaseConfig, apiKey: "test-key"};
    vi.mocked(readFirebaseStorage).mockResolvedValueOnce({schemaVersion: 2, dataModule: overallState.dataModule});

    await useSettingsStore().setRemoteStorageMethod({
        remoteStorageMethod: "firebase",
        shouldTakeDataFrom: "firebase",
        firebaseConfig: config,
    });

    expect(useSettingsStore().remoteStorageMethod).toBe("firebase");
    expect(readFirebaseStorage).toHaveBeenCalledWith(config);
    expect(useDataStore().posts["1"].title).toBe("post1t");
    expect(subscribeToFirebaseDataModule).toHaveBeenLastCalledWith(config, expect.any(Object));
});
