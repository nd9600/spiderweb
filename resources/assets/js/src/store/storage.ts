import {z} from "zod";
import {dataModuleStateSchema, importedDataModuleStateSchema} from "./models/DataModule";
import {firebaseModuleStateSchema, type FirebaseConfig} from "./models/Firebase";
import {settingsModuleStateSchema, type RemoteStorageMethod} from "./models/Settings";

export const STORAGE_SCHEMA_VERSION = 2;

export const offlineStorageObjectSchema = z.object({
    schemaVersion: z.literal(STORAGE_SCHEMA_VERSION).default(STORAGE_SCHEMA_VERSION),
    dataModule: dataModuleStateSchema,
    settingsModule: settingsModuleStateSchema,
    firebaseModule: firebaseModuleStateSchema,
});

function firebaseSelectionValues(value: unknown): unknown {
    // exportVal preserves numeric ID maps as objects; selection lists also arrive as objects keyed by index.
    return value != null && typeof value === "object" && !Array.isArray(value)
        ? Object.values(value)
        : value;
}

export const firebaseStorageObjectSchema = z.object({
    schemaVersion: z.literal(STORAGE_SCHEMA_VERSION).default(STORAGE_SCHEMA_VERSION),
    dataModule: dataModuleStateSchema.extend({
        selectedPostIds: z.preprocess(firebaseSelectionValues, dataModuleStateSchema.shape.selectedPostIds),
        selectedSubgraphIds: z.preprocess(firebaseSelectionValues, dataModuleStateSchema.shape.selectedSubgraphIds),
    }),
    updatedAt: z.unknown().optional(),
});

export const importedStorageObjectSchema = z.object({
    schemaVersion: z.number().optional().default(STORAGE_SCHEMA_VERSION),
    dataModule: importedDataModuleStateSchema.optional(),
    postsModule: importedDataModuleStateSchema.optional(),
    settingsModule: settingsModuleStateSchema.optional(),
    firebaseModule: firebaseModuleStateSchema.optional(),
}).refine(
    (storageObject) => {
        return storageObject.dataModule != null
            || storageObject.postsModule != null
            || storageObject.settingsModule != null
            || storageObject.firebaseModule != null;
    },
    "Imported storage must contain data, settings, or Firebase config"
);

export type OfflineStorageObject = z.infer<typeof offlineStorageObjectSchema>;
export type FirebaseStorageObject = z.infer<typeof firebaseStorageObjectSchema>;
export type ImportedStorageObject = z.infer<typeof importedStorageObjectSchema>;

export function importChangesFirebaseStorage(
    storageObject: ImportedStorageObject,
    currentStorageMethod: RemoteStorageMethod,
    currentFirebaseConfig: FirebaseConfig
): boolean {
    const importedStorageMethod = storageObject.settingsModule?.remoteStorageMethod ?? currentStorageMethod;
    if (importedStorageMethod !== "firebase") {
        return false;
    }
    if (currentStorageMethod !== "firebase") {
        return true;
    }

    const importedConfig = storageObject.firebaseModule?.firebaseConfig;
    if (importedConfig == null) {
        return false;
    }

    const configKeys = Object.keys(importedConfig) as (keyof FirebaseConfig)[];
    return configKeys.some((key) => importedConfig[key] !== currentFirebaseConfig[key]);
}

function formatZodError(error: z.ZodError): string {
    return error.issues
        .map((issue) => {
            const path = issue.path.length === 0
                ? "root"
                : issue.path.join(".");
            return `${path}: ${issue.message}`;
        })
        .join("\n");
}

export function parseFirebaseStorageObject(rawStorageObject: unknown): FirebaseStorageObject {
    const result = firebaseStorageObjectSchema.safeParse(rawStorageObject);
    if (result.success) {
        return result.data;
    }

    throw new Error(formatZodError(result.error));
}

export function parseImportedStorageObject(rawStorageObject: unknown): ImportedStorageObject {
    const result = importedStorageObjectSchema.safeParse(rawStorageObject);
    if (result.success) {
        return result.data;
    }

    throw new Error(formatZodError(result.error));
}
