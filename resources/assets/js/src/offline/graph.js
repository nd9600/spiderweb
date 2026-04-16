import Vue from "vue";

import OfflineRoot from "./OfflineRoot";
import store from "./store";

const mountElement = document.getElementById("offlineGraphApp");

if (mountElement) {
    new Vue({
        store,
        render: (createElement) => createElement(OfflineRoot)
    }).$mount(mountElement);
}
