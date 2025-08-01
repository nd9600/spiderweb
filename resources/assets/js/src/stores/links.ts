import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Link from '@/src/classes/Link'
import type { LinkId, PostId, GraphId, SubgraphId } from '@/src/@types/StoreTypes'
import type { LinkSerialised } from '@/src/classes/Link'
import { useSubgraphsStore } from './subgraphs'
import { useGraphsStore } from './graphs'

export const useLinksStore = defineStore('links', () => {
  // State
  const links = ref<Record<LinkId, LinkSerialised>>({})

  // Getters
  const linkIds = computed(() => Object.keys(links.value))

  // Actions
  function addLink(payload: {
    source: PostId
    target: PostId
    graph: GraphId
    type?: string
    subgraphIds?: SubgraphId[]
  }) {
    const { source, target, graph, type = 'reply', subgraphIds = [] } = payload

    const existingLinkIds = Object.keys(links.value)
    const highestLinkId = existingLinkIds.length === 0
      ? 0
      : Math.max(...existingLinkIds.map(id => parseInt(id, 10)))
    
    const newLinkId = String(highestLinkId + 1)

    // Check if link already exists
    const linkAlreadyExists = Object.values(links.value)
      .some(link => 
        link.graph === graph &&
        link.source === source &&
        link.target === target &&
        link.type === type
      )

    if (linkAlreadyExists) {
      alert('This link already exists')
      return
    }

    const link = new Link(newLinkId, graph, source, target, type)
    links.value[newLinkId] = link.serialise()

    // Add link to subgraphs if specified
    if (subgraphIds.length > 0) {
      const subgraphsStore = useSubgraphsStore()
      const graphsStore = useGraphsStore()
      
      for (const subgraphId of subgraphIds) {
        // Add source and target posts to subgraph if not already there
        subgraphsStore.addPostToSubgraph({ subgraphId, postId: source })
        subgraphsStore.addPostToSubgraph({ subgraphId, postId: target })
        
        // Add posts to graph if not already there
        graphsStore.addPostToGraph({ graphId: graph, postId: source })
        graphsStore.addPostToGraph({ graphId: graph, postId: target })
        
        // Add link to subgraph
        if (subgraphsStore.subgraphs[subgraphId]) {
          subgraphsStore.subgraphs[subgraphId].links.push(newLinkId)
        }
      }
    }

    return newLinkId
  }

  function updateLink(link: Link) {
    links.value[link.id] = link.serialise()
  }

  function changeLinkSource(payload: { id: LinkId; source: PostId }) {
    const { id, source } = payload
    
    const link = { ...links.value[id] }
    if (link.source === source || link.target === source) {
      return // you can't link a post to itself
    }
    
    link.source = source
    links.value[id] = link
  }

  function changeLinkTarget(payload: { id: LinkId; target: PostId }) {
    const { id, target } = payload
    
    const link = { ...links.value[id] }
    if (link.source === target || link.target === target) {
      return // you can't link a post to itself
    }
    
    link.target = target
    links.value[id] = link
  }

  function removeLink(payload: { id: LinkId }) {
    const { id } = payload
    
    // Remove link from subgraphs that contain it
    const subgraphsStore = useSubgraphsStore()
    
    // Find and remove link from all subgraphs
    for (const subgraph of Object.values(subgraphsStore.subgraphs)) {
      const linkIndex = subgraph.links.indexOf(id)
      if (linkIndex >= 0) {
        subgraph.links.splice(linkIndex, 1)
      }
    }
    
    // Remove the link itself
    delete links.value[id]
  }

  function setLinks(newLinks: Record<LinkId, LinkSerialised>) {
    links.value = newLinks
  }

  function setState(newState: Record<LinkId, LinkSerialised>) {
    links.value = newState
  }

  return {
    // State
    links,
    
    // Getters
    linkIds,
    
    // Actions
    addLink,
    updateLink,
    changeLinkSource,
    changeLinkTarget,
    removeLink,
    setLinks,
    setState
  }
})