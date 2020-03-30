import Vue from "vue";

import OfflineRoot from "./OfflineRoot";
import store from "./store";

new Vue({
    store,
    el: "#offlineGraphApp",
    components: {
        OfflineRoot
    },
    template: `<OfflineRoot/>`
});