import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  databaseURL: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export interface FirebaseState {
  firebaseConfig: FirebaseConfig
}

export const useFirebaseStore = defineStore('firebase', () => {
  // State
  const firebaseConfig = ref<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  })

  // Actions
  function setFirebaseConfig(config: Partial<FirebaseConfig>) {
    firebaseConfig.value = { ...firebaseConfig.value, ...config }
  }

  function setState(newState: Partial<FirebaseState>) {
    if (newState.firebaseConfig) {
      firebaseConfig.value = { ...firebaseConfig.value, ...newState.firebaseConfig }
    }
  }

  return {
    // State
    firebaseConfig,

    // Actions
    setFirebaseConfig,
    setState
  }
})