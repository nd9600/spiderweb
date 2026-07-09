import {z} from "zod";
import {dataModuleStateSchema, importedDataModuleStateSchema} from "./models/DataModule";
import {firebaseModuleStateSchema} from "./models/Firebase";
import {settingsModuleStateSchema} from "./models/Settings";

export const STORAGE_SCHEMA_VERSION = 2;

export const offlineStorageObjectSchema = z.object({
    schemaVersion: z.literal(STORAGE_SCHEMA_VERSION).default(STORAGE_SCHEMA_VERSION),
    dataModule: dataModuleStateSchema,
    settingsModule: settingsModuleStateSchema,
    firebaseModule: firebaseModuleStateSchema,
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
export type ImportedStorageObject = z.infer<typeof importedStorageObjectSchema>;

export function parseImportedStorageObject(rawStorageObject: unknown): ImportedStorageObject {
    const result = importedStorageObjectSchema.safeParse(rawStorageObject);
    if (result.success) {
        return result.data;
    }

    const message = result.error.issues
        .map((issue) => {
            const path = issue.path.length === 0
                ? "root"
                : issue.path.join(".");
            return `${path}: ${issue.message}`;
        })
        .join("\n");
    throw new Error(message);
}
