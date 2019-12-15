import Vue from "vue";
import OfflineTree from "./OfflineTree";

new Vue({
    el: "#offlineTreeApp",
    components: {
        OfflineTree
    },
    template: `
    <offline-tree/>
`
});