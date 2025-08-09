import { createApp } from 'vue'
import OfflineRoot from './OfflineRoot.vue'
import store from "./store";

createApp(OfflineRoot)
    .use(store)
    .mount('#app')
