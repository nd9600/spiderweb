import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import Post from '@/src/classes/Post'
import type { PostId } from '@/src/@types/StoreTypes'
import type { PostSerialised } from '@/src/classes/Post'
import { useGraphsStore } from './graphs'
import { useSubgraphsStore } from './subgraphs'
import { useLinksStore } from './links'

export const usePostsStore = defineStore('posts', () => {
  // State
  const posts = ref<Record<PostId, PostSerialised>>({})

  // Getters
  const postIds = computed(() => Object.keys(posts.value))

  const titleOrBody = computed(() => (postId: PostId) => {
    const MAX_BODY_LENGTH = 30
    const post = posts.value[postId]
    
    if (!post) return ''
    
    const possibleTitle = post.title.split('\n')[0].trim()
    if (possibleTitle.length > 0) {
      return possibleTitle
    }

    const strToReturn = post.body.split('\n')[0].trim()
    return strToReturn.length > MAX_BODY_LENGTH
      ? strToReturn.substr(0, MAX_BODY_LENGTH) + '..'
      : strToReturn
  })

  const unattachedPosts = computed(() => {
    const graphsStore = useGraphsStore()
    const allAttachedPostIds = Object.values(graphsStore.graphs)
      .flatMap(graph => graph.nodes)
    
    return Object.values(posts.value).filter(post => 
      !allAttachedPostIds.includes(post.id)
    )
  })

  const linkIds = computed(() => {
    const linksStore = useLinksStore()
    return Object.keys(linksStore.links)
  })

  // Actions
  async function makeNewPost(payload: {
    title: string
    body: string
    updatedAt: string
    createdAt: string
  }) {
    const existingPostIds = Object.keys(posts.value).map(id => parseInt(id, 10))
    const highestPostId = existingPostIds.length === 0 ? 0 : Math.max(...existingPostIds)
    const newPostId = String(highestPostId + 1)

    const newPost = new Post(newPostId, payload.title, payload.body, payload.createdAt, payload.updatedAt)
    posts.value[newPostId] = newPost.serialise()
    
    return newPost
  }

  function createPost(newPost: Post) {
    posts.value[newPost.id] = newPost.serialise()
    return newPost
  }

  function updatePostTitle(payload: { id: PostId; title: string; updatedAt: string }) {
    if (posts.value[payload.id]) {
      posts.value[payload.id].title = payload.title
      posts.value[payload.id].updatedAt = payload.updatedAt
    }
  }

  function updatePostBody(payload: { id: PostId; body: string; updatedAt: string }) {
    if (posts.value[payload.id]) {
      posts.value[payload.id].body = payload.body
      posts.value[payload.id].updatedAt = payload.updatedAt
    }
  }

  async function deletePost(payload: { id: PostId }) {
    const { id } = payload
    
    // Cascade deletions: remove post from all graphs, subgraphs, and delete related links
    const graphsStore = useGraphsStore()
    const subgraphsStore = useSubgraphsStore()
    const linksStore = useLinksStore()
    
    // Remove post from all graphs
    for (const graph of Object.values(graphsStore.graphs)) {
      if (graph.nodes.includes(id)) {
        graphsStore.removePostFromGraph({ graphId: graph.id, postId: id })
      }
    }
    
    // Remove post from all subgraphs
    for (const [subgraphId, subgraph] of Object.entries(subgraphsStore.subgraphs)) {
      if (subgraph.nodes.includes(id)) {
        subgraphsStore.removePostFromSubgraph({ subgraphId, postId: id })
      }
    }
    
    // Delete all links that reference this post
    const linksToDelete = Object.entries(linksStore.links)
      .filter(([_, link]) => link.source === id || link.target === id)
      .map(([linkId, _]) => linkId)
    
    for (const linkId of linksToDelete) {
      await linksStore.removeLink({ id: linkId })
    }
    
    // Delete the post itself
    delete posts.value[id]
  }

  function setState(newState: Record<PostId, PostSerialised>) {
    posts.value = newState
  }

  return {
    // State
    posts,
    
    // Getters
    postIds,
    titleOrBody,
    unattachedPosts,
    linkIds,
    
    // Actions
    makeNewPost,
    createPost,
    updatePostTitle,
    updatePostBody,
    deletePost,
    setState
  }
})

