import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

export default function (firebaseConfig) {
    if (firebaseConfig.apiKey === "") {
        throw new Error("firebase config is wrong, please check it: " + JSON.stringify(firebaseConfig));
    }
    if (!getApps().length) {
        initializeApp(firebaseConfig);
    }
    return getDatabase();
}