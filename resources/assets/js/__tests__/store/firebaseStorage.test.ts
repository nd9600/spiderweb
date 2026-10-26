import {deleteApp} from "firebase/app";
import {get, goOffline, onValue, ref, set, type Database, type DataSnapshot} from "firebase/database";

import {STORAGE_KEY} from "@/src/components/constants";
import firebaseDbFactory from "@/src/store/firebaseDbFactory";
import {readFirebaseStorage, subscribeToFirebaseDataModule} from "@/src/store/firebaseStorage";
import overallState from "./state";

vi.mock("firebase/database", async (importOriginal) => ({
    ...await importOriginal<typeof import("firebase/database")>(),
    get: vi.fn(),
}));

const config = {
    ...overallState.firebaseModule.firebaseConfig,
    apiKey: "test-key",
    databaseURL: "https://spiderweb-tests.firebaseio.com",
};
let db: Database;

beforeEach(() => {
    db = firebaseDbFactory(config);
    goOffline(db);
});

afterEach(async () => {
    await deleteApp(db.app);
    vi.clearAllMocks();
});

async function seedOfflineDatabase(): Promise<DataSnapshot> {
    const reference = ref(db, STORAGE_KEY);
    const snapshot = new Promise<DataSnapshot>((resolve) => {
        const unsubscribe = onValue(reference, (value) => {
            if (value.exists()) {
                resolve(value);
                unsubscribe();
            }
        });
    });
    // Offline writes update the SDK's local cache immediately; their server acknowledgements stay pending.
    void set(reference, {schemaVersion: 2, dataModule: overallState.dataModule});
    return snapshot;
}

test("loads numeric ID maps and ordered selections from a real Firebase snapshot", async () => {
    const snapshot = await seedOfflineDatabase();
    expect(Array.isArray(snapshot.val().dataModule.posts)).toBe(true);
    vi.mocked(get).mockResolvedValue(snapshot);

    const loaded = await readFirebaseStorage(config);

    expect(loaded).toEqual({schemaVersion: 2, dataModule: overallState.dataModule});
});

test("subscriptions preserve numeric record IDs and nested membership maps", async () => {
    await seedOfflineDatabase();
    const handlers = {
        posts: vi.fn(), graphs: vi.fn(), links: vi.fn(), subgraphs: vi.fn(),
        selectedPostIds: vi.fn(), selectedGraphId: vi.fn(), selectedSubgraphIds: vi.fn(), zoom: vi.fn(),
    };

    const unsubscribe = subscribeToFirebaseDataModule(config, handlers);

    expect(handlers.posts).toHaveBeenCalledWith(overallState.dataModule.posts);
    expect(handlers.graphs).toHaveBeenCalledWith(overallState.dataModule.graphs);
    expect(handlers.subgraphs).toHaveBeenCalledWith(overallState.dataModule.subgraphs);
    expect(handlers.selectedPostIds).toHaveBeenCalledWith(["4", "2"]);
    unsubscribe();
});

test("reuses matching Firebase config and switches databases when it changes", async () => {
    const other = firebaseDbFactory({...config, databaseURL: "https://spiderweb-other.firebaseio.com"});
    goOffline(other);
    try {
        expect(firebaseDbFactory(config)).toBe(db);
        expect(other).not.toBe(db);
        expect(other.app.options.databaseURL).toBe("https://spiderweb-other.firebaseio.com");
    } finally {
        await deleteApp(other.app);
    }
});
