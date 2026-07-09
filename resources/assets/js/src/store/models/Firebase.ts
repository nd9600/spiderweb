import {z} from "zod";

export const defaultFirebaseConfig = {
    apiKey: "",
    authDomain: "xxx.firebaseapp.com",
    databaseURL: "https://xxx.firebaseio.com",
    projectId: "xxx",
    storageBucket: "xxx.appspot.com",
    messagingSenderId: "123",
    appId: "456",
};

export const firebaseConfigSchema = z.object({
    apiKey: z.string().default(defaultFirebaseConfig.apiKey),
    authDomain: z.string().default(defaultFirebaseConfig.authDomain),
    databaseURL: z.string().default(defaultFirebaseConfig.databaseURL),
    projectId: z.string().default(defaultFirebaseConfig.projectId),
    storageBucket: z.string().default(defaultFirebaseConfig.storageBucket),
    messagingSenderId: z.string().default(defaultFirebaseConfig.messagingSenderId),
    appId: z.string().default(defaultFirebaseConfig.appId),
});

export const firebaseModuleStateSchema = z.object({
    firebaseConfig: firebaseConfigSchema.default(defaultFirebaseConfig),
});

export type FirebaseConfig = z.infer<typeof firebaseConfigSchema>;
export type FirebaseModuleState = z.infer<typeof firebaseModuleStateSchema>;
