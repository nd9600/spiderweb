import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { SubgraphId, GraphId, PostId } from '@/src/@types/StoreTypes'
import type { SubgraphSerialised } from '@/src/classes/Subgraph'
import { useGraphsStore } from './graphs'
import { useLinksStore } from './links'

function stringToColour(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF
    colour += ('00' + value.toString(16)).substr(-2)
  }
  return colour
}

export const useSubgraphsStore = defineStore('subgraphs', () => {
  // State
  const subgraphs = ref<Record<SubgraphId, SubgraphSerialised>>({})

  // Getters
  const subgraphColour = computed(() => (subgraphId: SubgraphId) => {
    if (typeof subgraphId === 'undefined') {
      return '#000000'
    }
    const subgraph = subgraphs.value[subgraphId]
    return (subgraph?.colour) || stringToColour(`${String(subgraphId)}salt and pepper are good for hashes`)
  })

  // Actions
  function makeNewSubgraph(payload: { graphId: GraphId; newSubgraphName: string }) {
    const { graphId, newSubgraphName } = payload

    if (newSubgraphName.trim().length === 0) {
      return
    }

    const existingSubgraphNames = Object.values(subgraphs.value).map(subgraph => subgraph.name)
    if (existingSubgraphNames.includes(newSubgraphName)) {
      alert("You're trying to make a subgraph that already exists, choose a different name")
      return
    }

    const existingSubgraphIds = Object.keys(subgraphs.value)
    const highestSubgraphId = existingSubgraphIds.length === 0
      ? 0
      : Math.max(...existingSubgraphIds.map(id => parseInt(id, 10)))
    
    const newSubgraphId = String(highestSubgraphId + 1)

    subgraphs.value[newSubgraphId] = {
      id: newSubgraphId,
      name: newSubgraphName,
      nodes: [],
      links: [],
      colour: stringToColour(`${newSubgraphId}salt and pepper are good for hashes`)
    }

    // Add subgraph to the graph
    const graphsStore = useGraphsStore()
    
    if (graphsStore.graphs[graphId] && !graphsStore.graphs[graphId].subgraphs.includes(newSubgraphId)) {
      graphsStore.graphs[graphId].subgraphs.push(newSubgraphId)
    }

    return newSubgraphId
  }

  function changeSubgraphName(payload: { subgraphId: SubgraphId; newSubgraphName: string }) {
    const { subgraphId, newSubgraphName } = payload
    if (subgraphs.value[subgraphId]) {
      subgraphs.value[subgraphId].name = newSubgraphName
    }
  }

  function changeSubgraphColour(payload: { subgraphId: SubgraphId; colour: string }) {
    const { subgraphId, colour } = payload
    if (subgraphs.value[subgraphId]) {
      subgraphs.value[subgraphId].colour = colour
    }
  }

  function removeSubgraph(subgraphId: SubgraphId) {
    delete subgraphs.value[subgraphId]
  }

  function addPostToSubgraph(payload: { subgraphId: SubgraphId; postId: PostId }) {
    const { subgraphId, postId } = payload
    
    // Add to subgraph if not already there
    const subgraph = subgraphs.value[subgraphId]
    if (subgraph && !subgraph.nodes.includes(postId)) {
      subgraph.nodes.push(postId)
    }
  }

  function removePostFromSubgraph(payload: { subgraphId: SubgraphId; postId: PostId }) {
    const { subgraphId, postId } = payload

    const subgraph = subgraphs.value[subgraphId]
    if (!subgraph) return

    // Remove post from subgraph
    const postIndex = subgraph.nodes.indexOf(postId)
    if (postIndex >= 0) {
      subgraph.nodes.splice(postIndex, 1)
    }
    
    // Remove links from this subgraph that involve the removed post
    const linksStore = useLinksStore()
    
    const linksToRemoveFromSubgraph = subgraph.links.filter(linkId => {
      const link = linksStore.links[linkId]
      return link && (link.source === postId || link.target === postId)
    })
    
    for (const linkId of linksToRemoveFromSubgraph) {
      const linkIndex = subgraph.links.indexOf(linkId)
      if (linkIndex >= 0) {
        subgraph.links.splice(linkIndex, 1)
      }
    }
  }

  function setState(newState: Record<SubgraphId, SubgraphSerialised>) {
    subgraphs.value = newState
  }

  return {
    // State
    subgraphs,
    
    // Getters
    subgraphColour,
    
    // Actions
    makeNewSubgraph,
    changeSubgraphName,
    changeSubgraphColour,
    removeSubgraph,
    addPostToSubgraph,
    removePostFromSubgraph,
    setState
  }
})