import {get, onValue, ref, serverTimestamp, set, update, type Unsubscribe} from "firebase/database";

import {STORAGE_KEY} from "@/src/components/constants";
import type {DataModuleState, FirebaseConfig} from "@/src/@types/StoreTypes";
import firebaseDbFactory from "./firebaseDbFactory";
import {
    dataModuleZoomSchema,
    graphsSchema,
    linksSchema,
    postsSchema,
    subgraphsSchema,
} from "./models/DataModule";
import {
    graphIdSchema,
    postIdSchema,
    subgraphIdSchema,
} from "./models/primitives";
import {
    parseFirebaseStorageObject,
    STORAGE_SCHEMA_VERSION,
    type FirebaseStorageObject,
} from "./storage";
import type {FirebaseUpdatePatch} from "./remoteSync";

export type FirebaseDataModuleHandlers = {
    posts(posts: DataModuleState["posts"]): void;
    graphs(graphs: DataModuleState["graphs"]): void;
    links(links: DataModuleState["links"]): void;
    subgraphs(subgraphs: DataModuleState["subgraphs"]): void;
    selectedPostIds(selectedPostIds: DataModuleState["selectedPostIds"]): void;
    selectedGraphId(selectedGraphId: DataModuleState["selectedGraphId"]): void;
    selectedSubgraphIds(selectedSubgraphIds: DataModuleState["selectedSubgraphIds"]): void;
    zoom(zoom: DataModuleState["zoom"]): void;
};

function storagePath(path = ""): string {
    return path.length === 0
        ? STORAGE_KEY
        : `${STORAGE_KEY}/${path}`;
}

export async function readFirebaseStorage(config: FirebaseConfig): Promise<Nullable<FirebaseStorageObject | string>> {
    const snapshot = await get(ref(firebaseDbFactory(config), STORAGE_KEY));
    const value = snapshot.val() as unknown;
    if (value == null) {
        return null;
    }

    if (typeof value === "string") {
        return value;
    }

    return parseFirebaseStorageObject(value);
}

export async function writeFirebaseStorage(config: FirebaseConfig, dataModule: DataModuleState): Promise<void> {
    await set(ref(firebaseDbFactory(config), STORAGE_KEY), {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        updatedAt: serverTimestamp(),
        dataModule,
    });
}

export async function updateFirebaseStorage(config: FirebaseConfig, patch: FirebaseUpdatePatch): Promise<void> {
    await update(ref(firebaseDbFactory(config), STORAGE_KEY), {
        ...patch,
        updatedAt: serverTimestamp(),
    });
}

export function subscribeToFirebaseDataModule(
    config: FirebaseConfig,
    handlers: FirebaseDataModuleHandlers
): Unsubscribe {
    const db = firebaseDbFactory(config);
    const unsubscribes = [
        onValue(ref(db, storagePath("dataModule/posts")), (snapshot) => {
            handlers.posts(postsSchema.parse(snapshot.val() ?? {}));
        }),
        onValue(ref(db, storagePath("dataModule/graphs")), (snapshot) => {
            handlers.graphs(graphsSchema.parse(snapshot.val() ?? {}));
        }),
        onValue(ref(db, storagePath("dataModule/links")), (snapshot) => {
            handlers.links(linksSchema.parse(snapshot.val() ?? {}));
        }),
        onValue(ref(db, storagePath("dataModule/subgraphs")), (snapshot) => {
            handlers.subgraphs(subgraphsSchema.parse(snapshot.val() ?? {}));
        }),
        onValue(ref(db, storagePath("dataModule/selectedPostIds")), (snapshot) => {
            handlers.selectedPostIds(postIdSchema.array().default([]).parse(snapshot.val() ?? []));
        }),
        onValue(ref(db, storagePath("dataModule/selectedGraphId")), (snapshot) => {
            handlers.selectedGraphId(graphIdSchema.nullable().default("1").parse(snapshot.val() ?? null));
        }),
        onValue(ref(db, storagePath("dataModule/selectedSubgraphIds")), (snapshot) => {
            handlers.selectedSubgraphIds(subgraphIdSchema.array().default([]).parse(snapshot.val() ?? []));
        }),
        onValue(ref(db, storagePath("dataModule/zoom")), (snapshot) => {
            handlers.zoom(dataModuleZoomSchema.parse(snapshot.val() ?? undefined));
        }),
    ];

    return () => {
        for (const unsubscribe of unsubscribes) {
            unsubscribe();
        }
    };
}
