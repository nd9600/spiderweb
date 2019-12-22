import Vue from "vue";

import OfflineGraph from "./OfflineGraph";
import store from "./store";

new Vue({
    store,
    el: "#offlineGraphApp",
    components: {
        OfflineGraph
    },
    template: `
    <offline-graph/>
`
});