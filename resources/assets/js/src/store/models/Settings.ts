import {z} from "zod";

export const remoteStorageMethodSchema = z.enum(["none", "firebase"]);
export const shouldTakeDataFromSchema = z.enum(["local", "firebase"]);

export const settingsModuleStateSchema = z.object({
    shouldAutosave: z.boolean().default(true),
    remoteStorageMethod: remoteStorageMethodSchema.default("none"),
    canOpenMultiplePosts: z.boolean().default(true),
    graphHeight: z.number().default(66),
    postBarHeight: z.number().default(66),
    postWidth: z.number().default(50),
});

export type RemoteStorageMethod = z.infer<typeof remoteStorageMethodSchema>;
export type ShouldTakeDataFrom = z.infer<typeof shouldTakeDataFromSchema>;
export type SettingsModuleState = z.infer<typeof settingsModuleStateSchema>;
