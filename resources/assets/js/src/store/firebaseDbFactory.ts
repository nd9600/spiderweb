import {getApps, initializeApp} from "firebase/app";
import {getDatabase} from "firebase/database";
import type {Database} from "firebase/database";
import type {FirebaseConfig} from "@/src/@types/StoreTypes";

export default function firebaseDbFactory(firebaseConfig: FirebaseConfig): Database {
    if (firebaseConfig.apiKey === "") {
        throw new Error("firebase config is wrong, please check it: " + JSON.stringify(firebaseConfig));
    }
    const firebaseApps = getApps();
    const configKeys = Object.keys(firebaseConfig) as (keyof FirebaseConfig)[];
    const firebaseApp = firebaseApps.find((app) => configKeys
        .every((key) => app.options[key] === firebaseConfig[key]))
        ?? initializeApp(firebaseConfig, `spiderweb-${firebaseApps.length}`);

    return getDatabase(firebaseApp);
}
