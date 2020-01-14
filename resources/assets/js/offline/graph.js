import Vue from "vue";

import Offline from "./Offline";
import store from "./store";

new Vue({
    store,
    el: "#offlineGraphApp",
    components: {
        Offline
    },
    template: `<offline/>`
});