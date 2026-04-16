import {createApp} from "vue";

import OfflineRoot from "./OfflineRoot";
import store from "./store";

const mountElement = document.getElementById("offlineGraphApp");

if (mountElement) {
    createApp(OfflineRoot)
        .use(store)
        .mount(mountElement);
}
