import { createApp } from 'vue'
import { pinia, useAppStore, useSettingsStore } from './stores'
import OfflineRoot from './offline/OfflineRoot.vue'

// Import CSS for Vite to process
import '../../css/app.css'
import '../../css/tailwind.min.css'

const app = createApp(OfflineRoot)
app.use(pinia)

const appStore = useAppStore()
const settingsStore = useSettingsStore()

// Auto-save functionality (similar to the old Vuex subscriber)
const isProduction = import.meta.env.PROD

appStore.$subscribe((mutation, state) => {
  const mutationsToIgnore = [
    'setLoadingApp',
    'setFailedToLoadData', 
    'setIsRenderingGraph',
    'setRemoteStorageMethod'
  ]

  const shouldSaveState = settingsStore.shouldAutosave &&
    !mutationsToIgnore.some(ignored => mutation.type.includes(ignored)) &&
    !mutation.type.endsWith('/setState')

  if (!isProduction) {
    console.log(mutation.type)
  }

  if (!shouldSaveState) {
    return
  }

  if (!isProduction) {
    console.log('autosaving, mutation is', mutation.type)
  }

  // Save to localStorage immediately
  const storageObject = appStore.storageObject
  const stringifiedStorage = JSON.stringify(storageObject)
  localStorage.setItem('offlineState', stringifiedStorage)

  // Debounced Firebase save (if enabled)
  if (settingsStore.remoteStorageMethod === 'firebase') {
    appStore.saveStateToStorage()
  }
})

app.mount('#app')