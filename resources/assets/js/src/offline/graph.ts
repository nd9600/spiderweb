import { createApp } from 'vue';
import OfflineRoot from './OfflineRoot.vue';
import { createPinia } from 'pinia';

const pinia = createPinia();
const app = createApp(OfflineRoot);
app.use(pinia);
app.mount('#offlineGraphApp');