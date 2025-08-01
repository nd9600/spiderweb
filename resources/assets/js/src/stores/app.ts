import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { usePostsStore } from './posts'
import { useGraphsStore } from './graphs'
import { useLinksStore } from './links'
import { useSubgraphsStore } from './subgraphs'
import { useFirebaseStore } from './firebase'
import { useSettingsStore } from './settings'
import { HEIGHT, INITIAL_ZOOM, STORAGE_KEY, WIDTH } from '@/src/commonComponents/constants'
import firebaseDbFactory from '@/src/offline/store/firebaseDbFactory'
import debounce from 'lodash/debounce'
import type { 
  PostId, 
  GraphId, 
  SubgraphId, 
  Zoom, 
  DataModuleStateSerialised,
  LinksMap
} from '@/src/@types/StoreTypes'
import Post from '@/src/classes/Post'
import Graph from '@/src/classes/Graph'
import Link from '@/src/classes/Link'
import Subgraph from '@/src/classes/Subgraph'

function arrayMove<T>(array: Array<T>, fromIndex: number, toIndex: number): Array<T> {
  const arrayCopy = array.slice(0)
  const element = array[fromIndex]
  arrayCopy.splice(fromIndex, 1)
  arrayCopy.splice(toIndex, 0, element)
  return arrayCopy
}

function objectMap<T, S>(f: (o: T) => S, o: Record<string, T>): Record<string, S> {
  return Object.assign({}, ...Object.keys(o).map(k => ({ [k]: f(o[k]) })))
}

export const useAppStore = defineStore('app', () => {
  // State
  const loadingApp = ref(true)
  const failedToLoadData = ref(false)
  const isRenderingGraph = ref(false)
  const selectedPostIds = ref<PostId[]>([])
  const selectedGraphId = ref<Nullable<GraphId>>('1')
  const selectedSubgraphIds = ref<SubgraphId[]>([])
  const zoom = ref<Zoom>({
    x: WIDTH / 2,
    y: HEIGHT / 2,
    scale: INITIAL_ZOOM,
  })

  // Getters
  const storageObject = computed(() => {
    const postsStore = usePostsStore()
    const graphsStore = useGraphsStore()
    const linksStore = useLinksStore()
    const subgraphsStore = useSubgraphsStore()
    const settingsStore = useSettingsStore()
    const firebaseStore = useFirebaseStore()

    return {
      dataModule: {
        posts: postsStore.posts,
        graphs: graphsStore.graphs,
        links: linksStore.links,
        subgraphs: subgraphsStore.subgraphs,
        selectedPostIds: selectedPostIds.value,
        selectedGraphId: selectedGraphId.value,
        selectedSubgraphIds: selectedSubgraphIds.value,
        zoom: zoom.value
      },
      settingsModule: settingsStore.$state,
      firebaseModule: firebaseStore.$state,
    }
  })

  const subgraphsInSelectedGraph = computed(() => {
    const graphsStore = useGraphsStore()
    const subgraphsStore = useSubgraphsStore()
    
    if (!selectedGraphId.value) return []
    
    const graph = graphsStore.graphs[selectedGraphId.value]
    if (!graph) return []
    
    return graph.subgraphs.map(id => subgraphsStore.subgraphs[id]).filter(Boolean)
  })

  const postIdsInSelectedSubgraphs = computed(() => {
    const graphsStore = useGraphsStore()
    const subgraphsStore = useSubgraphsStore()
    
    let postIDs: PostId[] = []

    if (selectedSubgraphIds.value.length > 0) {
      for (const selectedSubgraphId of selectedSubgraphIds.value) {
        const subgraph = subgraphsStore.subgraphs[selectedSubgraphId]
        if (subgraph) {
          postIDs = postIDs.concat(subgraph.nodes)
        }
      }
    } else if (selectedGraphId.value) {
      const graph = graphsStore.graphs[selectedGraphId.value]
      if (graph) {
        postIDs = graph.nodes
      }
    }
    
    return [...new Set(postIDs.filter(id => id != null))]
  })

  const postsInSelectedSubgraphs = computed(() => {
    const postsStore = usePostsStore()
    return postIdsInSelectedSubgraphs.value.map(id => postsStore.posts[id]).filter(Boolean)
  })

  const linksInSelectedSubgraphs = computed(() => {
    const linksStore = useLinksStore()
    const subgraphsStore = useSubgraphsStore()

    // If we have subgraphs selected, add the subgraphId to each link object
    if (selectedSubgraphIds.value.length > 0) {
      const linksWithSubgraphIDs: Array<{ linkId: string; subgraphId: SubgraphId }> = []
      
      for (const selectedSubgraphId of selectedSubgraphIds.value) {
        const subgraph = subgraphsStore.subgraphs[selectedSubgraphId]
        if (subgraph) {
          linksWithSubgraphIDs.push(
            ...subgraph.links.map(linkId => ({
              linkId,
              subgraphId: selectedSubgraphId
            }))
          )
        }
      }
      
      return linksWithSubgraphIDs
        .map(({ linkId, subgraphId }) => {
          const link = linksStore.links[linkId]
          if (link) {
            return { ...link, subgraphId }
          }
          return null
        })
        .filter(Boolean)
    } else {
      // Show all links in the selected graph
      const linkToSubgraphMap: Record<string, SubgraphId> = {}
      
      for (const subgraph of Object.values(subgraphsStore.subgraphs)) {
        for (const linkId of subgraph.links) {
          linkToSubgraphMap[linkId] = subgraph.id
        }
      }
      
      return Object.values(linksStore.links)
        .filter(link => selectedGraphId.value === link.graph)
        .map(link => {
          const subgraphId = linkToSubgraphMap[link.id]
          return subgraphId ? { ...link, subgraphId } : link
        })
    }
  })

  // Actions
  function setLoadingApp(loading: boolean) {
    loadingApp.value = loading
  }

  function setFailedToLoadData(failed: boolean) {
    failedToLoadData.value = failed
  }

  function setIsRenderingGraph(rendering: boolean) {
    isRenderingGraph.value = rendering
  }

  function setSelectedPostIds(postIds: PostId[]) {
    selectedPostIds.value = postIds
  }

  function selectPostId(payload: { id: PostId; canOpenMultiplePosts: boolean }) {
    const { id, canOpenMultiplePosts } = payload
    
    if (selectedPostIds.value.includes(id)) {
      selectedPostIds.value.splice(selectedPostIds.value.indexOf(id), 1)
    }
    
    if (canOpenMultiplePosts) {
      selectedPostIds.value.unshift(id)
    } else {
      selectedPostIds.value = [id]
    }
  }

  function unselectPostId(id: PostId) {
    const index = selectedPostIds.value.indexOf(id)
    if (index >= 0) {
      selectedPostIds.value.splice(index, 1)
    }
  }

  function togglePostId(payload: { id: PostId; canOpenMultiplePosts: boolean }) {
    const { id, canOpenMultiplePosts } = payload
    
    if (selectedPostIds.value.includes(id)) {
      selectedPostIds.value.splice(selectedPostIds.value.indexOf(id), 1)
    } else {
      if (canOpenMultiplePosts) {
        selectedPostIds.value.unshift(id)
      } else {
        selectedPostIds.value = [id]
      }
    }
  }

  function movePostLeft(id: PostId) {
    const currentIndex = selectedPostIds.value.indexOf(id)
    const newIndex = currentIndex === 0 ? selectedPostIds.value.length - 1 : currentIndex - 1
    selectedPostIds.value = arrayMove(selectedPostIds.value, currentIndex, newIndex)
  }

  function movePostRight(id: PostId) {
    const currentIndex = selectedPostIds.value.indexOf(id)
    const newIndex = currentIndex === (selectedPostIds.value.length - 1) ? 0 : currentIndex + 1
    selectedPostIds.value = arrayMove(selectedPostIds.value, currentIndex, newIndex)
  }

  function setSelectedGraphId(graphId: GraphId) {
    selectedSubgraphIds.value = []
    selectedGraphId.value = graphId
  }

  function setSelectedSubgraphIds(subgraphIds: SubgraphId[]) {
    selectedSubgraphIds.value = subgraphIds
  }

  function selectAllSubgraphs() {
    const graphsStore = useGraphsStore()
    if (selectedGraphId.value && graphsStore.graphs[selectedGraphId.value]) {
      selectedSubgraphIds.value = graphsStore.graphs[selectedGraphId.value].subgraphs
    }
  }

  function toggleSubgraphId(subgraphId: SubgraphId) {
    if (selectedSubgraphIds.value.includes(subgraphId)) {
      selectedSubgraphIds.value.splice(selectedSubgraphIds.value.indexOf(subgraphId), 1)
    } else {
      selectedSubgraphIds.value.push(subgraphId)
    }
  }

  function setZoom(newZoom: Zoom) {
    zoom.value = newZoom
  }

  // Storage actions
  async function saveStateToLocalStorage() {
    const stringifiedStorage = JSON.stringify(storageObject.value)
    localStorage.setItem(STORAGE_KEY, stringifiedStorage)
  }

  async function saveStateToStorage() {
    const settingsStore = useSettingsStore()
    const firebaseStore = useFirebaseStore()
    const stringifiedStorage = JSON.stringify(storageObject.value)

    localStorage.setItem(STORAGE_KEY, stringifiedStorage)

    const remoteStorageMethod = settingsStore.remoteStorageMethod
    switch (remoteStorageMethod) {
      case 'firebase': {
        const firebaseDB = firebaseDbFactory(firebaseStore.firebaseConfig)
        firebaseDB.ref(STORAGE_KEY).set(stringifiedStorage)
        break
      }
      default:
        break
    }
  }

  async function loadStateFromStorage() {
    const settingsStore = useSettingsStore()
    const localStorageItem = localStorage.getItem(STORAGE_KEY)
    
    if (localStorageItem === null) {
      setLoadingApp(false)
      return
    }
    
    const localStorageObject = JSON.parse(localStorageItem)
    const remoteStorageMethod = localStorageObject.settingsModule?.remoteStorageMethod

    switch (remoteStorageMethod) {
      case 'firebase': {
        try {
          let loadedDataSuccessfully = false
          const firebaseDB = firebaseDbFactory(localStorageObject.firebaseModule.firebaseConfig)
          
          firebaseDB.ref(STORAGE_KEY).once('value')
            .then((snapshot: any) => {
              const firebaseStorageObject = JSON.parse(snapshot.val())
              if (firebaseStorageObject !== null) {
                importState(firebaseStorageObject)
                loadedDataSuccessfully = true
                setLoadingApp(false)
              } else {
                setFailedToLoadData(true)
              }
            })
            .catch((error: any) => {
              console.log(error)
              alert("There was an error loading the state from Firebase, please refresh the page/change your Firebase config in 'settings', and try again")
            })

          setTimeout(() => {
            if (!loadedDataSuccessfully) {
              setFailedToLoadData(true)
            }
          }, 10000)
        } catch (error) {
          settingsStore.setRemoteStorageMethod('none')
          setLoadingApp(false)
          alert(error)
          return
        }
        break
      }
      case 'none':
      default: {
        importState(localStorageObject)
        setLoadingApp(false)
        break
      }
    }
  }

  async function loadDataFrom(shouldTakeDataFrom: string) {
    const firebaseStore = useFirebaseStore()
    
    switch (shouldTakeDataFrom) {
      case 'local': {
        const localStorageItem = localStorage.getItem(STORAGE_KEY)
        if (localStorageItem === null) {
          return
        }
        const localStorageObject = JSON.parse(localStorageItem)
        importData(localStorageObject)
        break
      }
      case 'firebase': {
        setLoadingApp(true)
        try {
          const firebaseDB = firebaseDbFactory(firebaseStore.firebaseConfig)
          const firebaseSnapshot = await firebaseDB.ref(STORAGE_KEY).once('value')
          const firebaseStorageObject = JSON.parse(firebaseSnapshot.val())
          await importData(firebaseStorageObject)
        } catch (error) {
          console.log(error)
          alert("There was an error loading the data from Firebase, please refresh the page/change your Firebase config in 'settings', and try again")
        }
        setLoadingApp(false)
        break
      }
      default:
        break
    }
  }

  function importState(storageObject: any) {
    const postsStore = usePostsStore()
    const graphsStore = useGraphsStore()
    const linksStore = useLinksStore()
    const subgraphsStore = useSubgraphsStore()
    const settingsStore = useSettingsStore()
    const firebaseStore = useFirebaseStore()

    if (storageObject.dataModule || storageObject.postsModule) {
      const dataModule = storageObject.dataModule || storageObject.postsModule
      setState(dataModule)
    }

    if (storageObject.settingsModule) {
      settingsStore.setState(storageObject.settingsModule)
    }
    
    if (storageObject.firebaseModule) {
      firebaseStore.setState(storageObject.firebaseModule)
    }
  }

  function importData(storageObject: any) {
    if (storageObject.dataModule) {
      setState(storageObject.dataModule)
    }
  }

  async function importSettings(payload: { storageObject: any; shouldTakeDataFrom: string }) {
    const { storageObject, shouldTakeDataFrom } = payload
    const settingsStore = useSettingsStore()
    const firebaseStore = useFirebaseStore()
    
    const isStorageMethodChanging = settingsStore.remoteStorageMethod !== storageObject.settingsModule?.remoteStorageMethod

    if (storageObject.settingsModule) {
      settingsStore.setState(storageObject.settingsModule)
    }
    
    if (storageObject.firebaseModule) {
      firebaseStore.setState(storageObject.firebaseModule)
    }

    if (isStorageMethodChanging) {
      await loadDataFrom(shouldTakeDataFrom)
    }
  }

  function setState(newState: DataModuleStateSerialised) {
    const postsStore = usePostsStore()
    const graphsStore = useGraphsStore()
    const linksStore = useLinksStore()
    const subgraphsStore = useSubgraphsStore()

    if (Object.keys(newState).length === 0 || Object.keys(newState.posts || {}).length === 0) {
      return
    }

    if (newState.graphs) {
      graphsStore.setState(objectMap(Graph.unserialise, newState.graphs))
    }
    
    if (newState.posts) {
      postsStore.setState(objectMap(Post.unserialise, newState.posts))
    }
    
    if (newState.links) {
      linksStore.setState(objectMap(Link.unserialise, newState.links))
    }
    
    if (newState.subgraphs) {
      subgraphsStore.setState(objectMap(Subgraph.unserialise, newState.subgraphs))
    }

    selectedPostIds.value = (newState.selectedPostIds || []).map(String)
    selectedGraphId.value = String(newState.selectedGraphId || '1')
    selectedSubgraphIds.value = (newState.selectedSubgraphIds || []).map(String)

    zoom.value = newState.zoom || {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      scale: INITIAL_ZOOM,
    }
  }

  return {
    // State
    loadingApp,
    failedToLoadData,
    isRenderingGraph,
    selectedPostIds,
    selectedGraphId,
    selectedSubgraphIds,
    zoom,

    // Getters
    storageObject,
    subgraphsInSelectedGraph,
    postIdsInSelectedSubgraphs,
    postsInSelectedSubgraphs,
    linksInSelectedSubgraphs,

    // Actions
    setLoadingApp,
    setFailedToLoadData,
    setIsRenderingGraph,
    setSelectedPostIds,
    selectPostId,
    unselectPostId,
    togglePostId,
    movePostLeft,
    movePostRight,
    setSelectedGraphId,
    setSelectedSubgraphIds,
    selectAllSubgraphs,
    toggleSubgraphId,
    setZoom,
    saveStateToLocalStorage,
    saveStateToStorage,
    loadStateFromStorage,
    loadDataFrom,
    importState,
    importData,
    importSettings,
    setState
  }
})