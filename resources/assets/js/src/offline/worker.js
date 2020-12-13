import {STORAGE_KEY} from "@/src/commonComponents/constants";
import firebaseDbFactory from "@/src/offline/store/firebaseDbFactory";

self.addEventListener("message", function (event) {
    // var start = Date.now(); // milliseconds
    // var x = 0;
    // for (var i = 0; i < 25000000; i++) {
    //     x = x + i;
    // }
    // console.log('ended in : ', -(start - Date.now())/1000, ' seconds');
    console.log("in worker", event.data);
    if (event.data.type === "saveState") {
        const stringifiedStorage = JSON.stringify(event.data.storageObject);

        if (!event.data.isProduction) {
            console.log("autosaving, mutation is", event.data.mutationType);
        }

        localStorage.setItem(STORAGE_KEY, stringifiedStorage);
        // if (event.data.shouldSaveToFirebase) {
        //     console.log(window);
        //     const firebaseDB = firebaseDbFactory(event.data.firebaseConfig);
        //     firebaseDB.ref(STORAGE_KEY).set(stringifiedStorage);
        // }

        self.postMessage("saved state");
    } else {
        console.log("unrecognised type: " + event.data.type);
    }
});