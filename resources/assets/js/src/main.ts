import { createApp } from 'vue';
import { createPinia } from 'pinia';
import OfflineRoot from './offline/OfflineRoot.vue';

const pinia = createPinia();
const app = createApp(OfflineRoot);
app.use(pinia);
app.mount('#app');