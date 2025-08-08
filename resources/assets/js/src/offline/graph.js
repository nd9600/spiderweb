import Vue from "vue";
import "../../css/app.css";
import "../../css/tailwind.min.css";

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