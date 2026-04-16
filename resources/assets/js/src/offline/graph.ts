import {createApp} from "vue";

import OfflineRoot from "./OfflineRoot.vue";
import pinia from "./store";

const mountElement = document.getElementById("offlineGraphApp");

if (mountElement) {
    createApp(OfflineRoot)
        .use(pinia)
        .mount(mountElement);
}
