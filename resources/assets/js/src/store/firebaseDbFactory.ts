import {getApp, getApps, initializeApp} from "firebase/app";
import {getDatabase} from "firebase/database";
import type {Database} from "firebase/database";
import type {FirebaseConfig} from "@/src/@types/StoreTypes";

export default function firebaseDbFactory(firebaseConfig: FirebaseConfig): Database {
    if (firebaseConfig.apiKey === "") {
        throw new Error("firebase config is wrong, please check it: " + JSON.stringify(firebaseConfig));
    }
    const firebaseApp = getApps().length > 0
        ? getApp()
        : initializeApp(firebaseConfig);

    return getDatabase(firebaseApp);
}
