import {createPinia} from "pinia";

export {useClickerStore} from "./modules/clickerModule";
export {useDataStore} from "./modules/dataModule";
export {useFirebaseStore} from "./modules/firebaseModule";
export {useRootStore} from "./modules/rootStore";
export {useSettingsStore} from "./modules/settingsModule";

const pinia = createPinia();

export default pinia;
