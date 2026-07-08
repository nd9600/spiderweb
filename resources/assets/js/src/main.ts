import "../../css/app.css";
import "../../css/tailwind.min.css";

import {createApp} from "vue";

import App from "./App.vue";
import pinia from "./store";

createApp(App)
    .use(pinia)
    .mount("#offlineGraphApp");

