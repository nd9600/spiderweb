import { defineStore } from 'pinia';
import { isInteger } from '@/src/helpers/numberHelpers';

const useSettingsModule = defineStore('settingsModule', {
  state: () => ({
    shouldAutosave: true,
    remoteStorageMethod: 'none',
    canOpenMultiplePosts: true,
    graphHeight: 66,
    postBarHeight: 66,
    postWidth: 50,
  }),
  getters: {},
  actions: {
    setState(newState: any) {
      this.shouldAutosave = newState.shouldAutosave == null ? true : newState.shouldAutosave;
      this.canOpenMultiplePosts = newState.canOpenMultiplePosts == null ? true : newState.canOpenMultiplePosts;
      this.remoteStorageMethod = newState.remoteStorageMethod || 'none';
      this.graphHeight = newState.graphHeight || 66;
      this.postBarHeight = newState.postBarHeight || 66;
      this.postWidth = newState.postWidth || 50;
    },
    setShouldAutosave(shouldAutosave: boolean) {
      this.shouldAutosave = shouldAutosave;
    },
    setRemoteStorageMethod(remoteStorageMethod: string) {
      this.remoteStorageMethod = remoteStorageMethod;
    },
    setCanOpenMultiplePosts(canOpenMultiplePosts: boolean) {
      this.canOpenMultiplePosts = canOpenMultiplePosts;
    },
    setGraphHeight(graphHeight: number) {
      if (!isInteger(graphHeight) || graphHeight > 100) return;
      this.graphHeight = graphHeight;
    },
    setPostBarHeight(postBarHeight: number) {
      if (!isInteger(postBarHeight) || postBarHeight > 100) return;
      this.postBarHeight = postBarHeight;
    },
    setPostWidth(postWidth: number) {
      if (!isInteger(postWidth) || postWidth > 100) return;
      this.postWidth = postWidth;
    },
  },
});