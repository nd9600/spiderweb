import Vue from "vue";

import OfflineTree from "./OfflineTree";
import store from "./store";

new Vue({
    store,
    el: "#offlineTreeApp",
    components: {
        OfflineTree
    },
    template: `
    <offline-tree/>
`
});