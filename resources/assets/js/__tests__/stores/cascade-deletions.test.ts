import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { 
  usePostsStore, 
  useGraphsStore, 
  useLinksStore, 
  useSubgraphsStore,
  useAppStore
} from '@/src/stores'

describe('Cascade Deletions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should cascade delete links and subgraph references when deleting a post', async () => {
    const postsStore = usePostsStore()
    const graphsStore = useGraphsStore()
    const linksStore = useLinksStore()
    const subgraphsStore = useSubgraphsStore()
    const appStore = useAppStore()

    // Set up test data
    appStore.setSelectedGraphId('1')
    
    // Create posts
    const post1 = await postsStore.makeNewPost({
      title: 'Post 1',
      body: 'Body 1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    })
    
    const post2 = await postsStore.makeNewPost({
      title: 'Post 2', 
      body: 'Body 2',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    })

    // Add posts to graph
    graphsStore.addPostToGraph({ graphId: '1', postId: post1.id })
    graphsStore.addPostToGraph({ graphId: '1', postId: post2.id })

    // Create a subgraph
    await subgraphsStore.makeNewSubgraph({ graphId: '1', newSubgraphName: 'Test Subgraph' })
    const subgraphId = Object.keys(subgraphsStore.subgraphs)[0]

    // Add posts to subgraph
    subgraphsStore.addPostToSubgraph({ subgraphId, postId: post1.id })
    subgraphsStore.addPostToSubgraph({ subgraphId, postId: post2.id })

    // Create a link between posts
    await linksStore.addLink({
      source: post1.id,
      target: post2.id,
      graph: '1',
      type: 'reply',
      subgraphIds: [subgraphId]
    })

    // Verify setup
    expect(Object.keys(postsStore.posts)).toHaveLength(2)
    expect(Object.keys(linksStore.links)).toHaveLength(1)
    expect(subgraphsStore.subgraphs[subgraphId].nodes).toHaveLength(2)
    expect(subgraphsStore.subgraphs[subgraphId].links).toHaveLength(1)

    // Delete post1
    await postsStore.deletePost({ id: post1.id })

    // Verify cascade deletions
    expect(Object.keys(postsStore.posts)).toHaveLength(1) // Only post2 remains
    expect(postsStore.posts[post2.id]).toBeDefined()
    expect(postsStore.posts[post1.id]).toBeUndefined()

    // Link should be deleted because it referenced the deleted post
    expect(Object.keys(linksStore.links)).toHaveLength(0)

    // Post should be removed from subgraph
    expect(subgraphsStore.subgraphs[subgraphId].nodes).toHaveLength(1)
    expect(subgraphsStore.subgraphs[subgraphId].nodes).toContain(post2.id)
    expect(subgraphsStore.subgraphs[subgraphId].nodes).not.toContain(post1.id)

    // Link should be removed from subgraph
    expect(subgraphsStore.subgraphs[subgraphId].links).toHaveLength(0)

    // Post should be removed from graph
    expect(graphsStore.graphs['1'].nodes).toHaveLength(1)
    expect(graphsStore.graphs['1'].nodes).toContain(post2.id)
    expect(graphsStore.graphs['1'].nodes).not.toContain(post1.id)
  })

  it('should cascade delete subgraphs and links when deleting a graph', async () => {
    const graphsStore = useGraphsStore()
    const linksStore = useLinksStore()
    const subgraphsStore = useSubgraphsStore()
    const appStore = useAppStore()

    // Create a new graph
    graphsStore.makeNewGraph('Test Graph')
    const graphId = Object.keys(graphsStore.graphs).find(id => id !== '1')!
    
    appStore.setSelectedGraphId(graphId)

    // Create a subgraph in the new graph
    await subgraphsStore.makeNewSubgraph({ graphId, newSubgraphName: 'Test Subgraph' })
    const subgraphId = Object.keys(subgraphsStore.subgraphs)[0]

    // Create a link in the new graph
    await linksStore.addLink({
      source: '1',
      target: '2', 
      graph: graphId,
      type: 'reply'
    })

    // Verify setup
    expect(graphsStore.graphs[graphId]).toBeDefined()
    expect(Object.keys(subgraphsStore.subgraphs)).toHaveLength(1)
    expect(Object.keys(linksStore.links)).toHaveLength(1)
    expect(graphsStore.graphs[graphId].subgraphs).toContain(subgraphId)

    // Delete the graph
    await graphsStore.removeGraph(graphId)

    // Verify cascade deletions
    expect(graphsStore.graphs[graphId]).toBeUndefined()
    
    // Subgraph should be deleted
    expect(Object.keys(subgraphsStore.subgraphs)).toHaveLength(0)
    
    // Link should be deleted
    expect(Object.keys(linksStore.links)).toHaveLength(0)
  })

  it('should cascade delete links from subgraphs when deleting a link', async () => {
    const linksStore = useLinksStore()
    const subgraphsStore = useSubgraphsStore()
    const appStore = useAppStore()

    appStore.setSelectedGraphId('1')

    // Create a subgraph
    await subgraphsStore.makeNewSubgraph({ graphId: '1', newSubgraphName: 'Test Subgraph' })
    const subgraphId = Object.keys(subgraphsStore.subgraphs)[0]

    // Create a link and add it to the subgraph
    await linksStore.addLink({
      source: '1',
      target: '2',
      graph: '1', 
      type: 'reply',
      subgraphIds: [subgraphId]
    })

    const linkId = Object.keys(linksStore.links)[0]

    // Verify setup
    expect(Object.keys(linksStore.links)).toHaveLength(1)
    expect(subgraphsStore.subgraphs[subgraphId].links).toContain(linkId)

    // Remove the link
    await linksStore.removeLink({ id: linkId })

    // Verify cascade deletion
    expect(Object.keys(linksStore.links)).toHaveLength(0)
    expect(subgraphsStore.subgraphs[subgraphId].links).toHaveLength(0)
  })

  it('should cascade delete links when removing a post from a subgraph', async () => {
    const linksStore = useLinksStore()
    const subgraphsStore = useSubgraphsStore()
    const appStore = useAppStore()

    appStore.setSelectedGraphId('1')

    // Create a subgraph
    await subgraphsStore.makeNewSubgraph({ graphId: '1', newSubgraphName: 'Test Subgraph' })
    const subgraphId = Object.keys(subgraphsStore.subgraphs)[0]

    // Add posts to subgraph
    subgraphsStore.addPostToSubgraph({ subgraphId, postId: '1' })
    subgraphsStore.addPostToSubgraph({ subgraphId, postId: '2' })

    // Create a link between the posts in the subgraph
    await linksStore.addLink({
      source: '1',
      target: '2',
      graph: '1',
      type: 'reply',
      subgraphIds: [subgraphId]
    })

    const linkId = Object.keys(linksStore.links)[0]

    // Verify setup
    expect(subgraphsStore.subgraphs[subgraphId].nodes).toHaveLength(2)
    expect(subgraphsStore.subgraphs[subgraphId].links).toContain(linkId)

    // Remove post '1' from subgraph
    await subgraphsStore.removePostFromSubgraph({ subgraphId, postId: '1' })

    // Verify cascade deletion
    expect(subgraphsStore.subgraphs[subgraphId].nodes).toHaveLength(1)
    expect(subgraphsStore.subgraphs[subgraphId].nodes).toContain('2')
    
    // Link should be removed from subgraph because one of its posts was removed
    expect(subgraphsStore.subgraphs[subgraphId].links).toHaveLength(0)
  })
})