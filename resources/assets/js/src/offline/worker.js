importScripts("https://www.gstatic.com/firebasejs/8.1.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.1.2/firebase-database.js");

self.addEventListener("message", function (event) {
    // var start = Date.now(); // milliseconds
    // var x = 0;
    // for (var i = 0; i < 1000000000; i++) {
    //     x = x + i;
    // }
    // console.log('ended in : ', -(start - Date.now())/1000, ' seconds');
    // console.log("in worker", event.data.type);

    if (event.data.type === "saveState") {
        if (event.data.shouldSaveToFirebase) {
            firebase.initializeApp(event.data.firebaseConfig);
            const firebaseDB = firebase.database;
            firebaseDB.ref(STORAGE_KEY).set(event.data.stringifiedStorage);
        }

        self.postMessage("saved state");
    } else {
        console.log("unrecognised type: " + event.data.type);
    }
});