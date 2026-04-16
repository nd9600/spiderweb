import firebase from "firebase/app";
import "firebase/database";
import type {FirebaseConfig} from "@/src/@types/StoreTypes";

export default function firebaseDbFactory(firebaseConfig: FirebaseConfig): firebase.database.Database {
    if (firebaseConfig.apiKey === "") {
        throw new Error("firebase config is wrong, please check it: " + JSON.stringify(firebaseConfig));
    }
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    return firebase.database();
}
