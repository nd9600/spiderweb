import { defineStore } from 'pinia'
import { ref } from 'vue'
import Graph from '@/src/classes/Graph'
import type { 
  GraphId, 
  PostId, 
  NodePosition
} from '@/src/@types/StoreTypes'
import type { GraphSerialised } from '@/src/classes/Graph'

// Import other stores - will be resolved at runtime
import { useSubgraphsStore } from './subgraphs'
import { useLinksStore } from './links'

export const useGraphsStore = defineStore('graphs', () => {
  // State
  const graphs = ref<Record<GraphId, GraphSerialised>>({
    '1': {
      id: '1',
      name: 'default',
      nodes: [],
      nodePositions: {},
      subgraphs: [],
    }
  })

  // Actions
  function makeNewGraph(newGraphName: string) {
    if (newGraphName.trim().length === 0) {
      return
    }

    const existingGraphNames = Object.values(graphs.value).map(graph => graph.name)
    if (existingGraphNames.includes(newGraphName)) {
      alert("You're trying to add a graph that already exists, choose a different name")
      return
    }

    const existingGraphIds = Object.keys(graphs.value)
    const highestGraphId = existingGraphIds.length === 0
      ? 0
      : Math.max(...existingGraphIds.map(id => parseInt(id, 10)))
    
    const newGraphId = String(highestGraphId + 1)
    const newGraph = new Graph(newGraphId, newGraphName, [], {}, [])

    graphs.value[newGraphId] = newGraph.serialise()
  }

  function changeGraphName(payload: { graphId: GraphId; newGraphName: string }) {
    const { graphId, newGraphName } = payload
    if (graphs.value[graphId]) {
      graphs.value[graphId].name = newGraphName
    }
  }

  async function removeGraph(graphId: GraphId) {
    // Cascade deletions: remove all subgraphs and links in this graph
    // Use lazy evaluation to avoid circular dependency issues
    const subgraphsStore = useSubgraphsStore()
    const linksStore = useLinksStore()
    
    // Remove all subgraphs associated with this graph
    const subgraphsToDelete = Object.entries(subgraphsStore.subgraphs)
      .filter(([_, subgraph]) => graphs.value[graphId]?.subgraphs.includes(subgraph.id))
      .map(([subgraphId, _]) => subgraphId)
    
    for (const subgraphId of subgraphsToDelete) {
      subgraphsStore.removeSubgraph(subgraphId)
    }
    
    // Remove all links in this graph
    const linksToDelete = Object.entries(linksStore.links)
      .filter(([_, link]) => link.graph === graphId)
      .map(([linkId, _]) => linkId)
    
    for (const linkId of linksToDelete) {
      await linksStore.removeLink({ id: linkId })
    }
    
    // Remove the graph itself
    delete graphs.value[graphId]
  }

  function addPostToGraph(payload: { graphId: GraphId; postId: PostId }) {
    const { graphId, postId } = payload
    if (graphs.value[graphId] && !graphs.value[graphId].nodes.includes(postId)) {
      graphs.value[graphId].nodes.push(postId)
    }
  }

  function removePostFromGraph(payload: { graphId: GraphId; postId: PostId }) {
    const { graphId, postId } = payload

    if (!graphs.value[graphId]) return

    // Remove post position
    delete graphs.value[graphId].nodePositions[postId]

    // Remove post from graph nodes
    graphs.value[graphId].nodes = graphs.value[graphId].nodes.filter(id => id !== postId)
  }

  function setPostPosition(payload: { postId: PostId; position: NodePosition; graphId: GraphId }) {
    const { postId, position, graphId } = payload
    
    if (graphs.value[graphId]) {
      graphs.value[graphId].nodePositions[postId] = position
    }
  }

  function setState(newState: Record<GraphId, GraphSerialised>) {
    graphs.value = newState
  }

  return {
    // State
    graphs,
    
    // Actions
    makeNewGraph,
    changeGraphName,
    removeGraph,
    addPostToGraph,
    removePostFromGraph,
    setPostPosition,
    setState
  }
})