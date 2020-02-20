import * as firebase from "firebase/app";
import "firebase/database";

export default function (firebaseConfig) {
    if (firebaseConfig.apiKey === "") {
        throw new Error("firebase config is wrong, please check it");
    }
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    return firebase.database();
}