import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SettingsState {
  shouldAutosave: boolean
  remoteStorageMethod: 'none' | 'firebase'
  postWidth: number
  canOpenMultiplePosts: boolean
}

export const useSettingsStore = defineStore('settings', () => {
  // State
  const shouldAutosave = ref(true)
  const remoteStorageMethod = ref<'none' | 'firebase'>('none')
  const postWidth = ref(200)
  const canOpenMultiplePosts = ref(true)

  // Actions
  function setShouldAutosave(value: boolean) {
    shouldAutosave.value = value
  }

  function setRemoteStorageMethod(method: 'none' | 'firebase') {
    remoteStorageMethod.value = method
  }

  function setPostWidth(width: number) {
    postWidth.value = width
  }

  function setCanOpenMultiplePosts(value: boolean) {
    canOpenMultiplePosts.value = value
  }

  function setState(newState: Partial<SettingsState>) {
    if (newState.shouldAutosave !== undefined) {
      shouldAutosave.value = newState.shouldAutosave
    }
    if (newState.remoteStorageMethod !== undefined) {
      remoteStorageMethod.value = newState.remoteStorageMethod
    }
    if (newState.postWidth !== undefined) {
      postWidth.value = newState.postWidth
    }
    if (newState.canOpenMultiplePosts !== undefined) {
      canOpenMultiplePosts.value = newState.canOpenMultiplePosts
    }
  }

  return {
    // State
    shouldAutosave,
    remoteStorageMethod,
    postWidth,
    canOpenMultiplePosts,

    // Actions
    setShouldAutosave,
    setRemoteStorageMethod,
    setPostWidth,
    setCanOpenMultiplePosts,
    setState
  }
})