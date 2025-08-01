import { createPinia } from 'pinia'

export const pinia = createPinia()

// Re-export all stores for easy importing
export { usePostsStore } from './posts'
export { useGraphsStore } from './graphs'
export { useLinksStore } from './links'
export { useSubgraphsStore } from './subgraphs'
export { useAppStore } from './app'
export { useSettingsStore } from './settings'
export { useFirebaseStore } from './firebase'