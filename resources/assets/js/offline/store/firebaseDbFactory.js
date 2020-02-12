import * as firebase from "firebase/app";
import "firebase/database";

export default function (firebaseConfig) {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    return firebase.database();
}