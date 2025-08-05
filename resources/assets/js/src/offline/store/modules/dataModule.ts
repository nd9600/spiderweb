import { defineStore } from 'pinia';
import { Graph, Post, Link, Subgraph } from '@/src/offline/store/classes';
import { DataModuleState, Zoom } from '@/src/@types/StoreTypes';
import { objectMap, arrayMove } from '@/src/helpers/vuexHelpers';

const useDataModule = defineStore('dataModule', {
  state: (): DataModuleState => ({
    graphs: {},
    posts: {},
    links: {},
    subgraphs: {},
    selectedPostIds: [],
    selectedGraphId: null,
    selectedSubgraphIds: [],
    zoom: {
      x: 0,
      y: 0,
      scale: 1,
    },
  }),
  getters: {
    subgraphsInSelectedGraph: (state: DataModuleState) => {
      const graph = state.graphs[state.selectedGraphId!];
      return graph?.subgraphs.map(id => state.subgraphs[id]) || [];
    },
    postIdsInSelectedSubgraphs: (state: DataModuleState) => {
      let postIDs: string[] = [];
      if (state.selectedSubgraphIds.length > 0) {
        for (let selectedSubgraphId of state.selectedSubgraphIds) {
          postIDs = postIDs.concat(state.subgraphs[selectedSubgraphId].nodes);
        }
      } else {
        postIDs = state.graphs[state.selectedGraphId!]?.nodes || [];
      }
      const uniquePostIDs = [...new Set(postIDs.filter(id => id != null))];
      return uniquePostIDs;
    },
    postsInSelectedSubgraphs: (state: DataModuleState) => {
      return this.postIdsInSelectedSubgraphs.map((id: string) => state.posts[id]);
    },
    linksInSelectedSubgraphs: (state: DataModuleState) => {
      if (state.selectedSubgraphIds.length > 0) {
        let linksWithSubgraphIDs: Array<{ linkId: string; subgraphId: string }> = [];
        for (let selectedSubgraphId of state.selectedSubgraphIds) {
          linksWithSubgraphIDs = linksWithSubgraphIDs.concat(
            state.subgraphs[selectedSubgraphId].links
              .map(linkId => ({
                linkId,
                subgraphId: selectedSubgraphId
              }))
          );
        }
        return linksWithSubgraphIDs
          .map(({ linkId, subgraphId }) => {
            let link = { ...state.links[linkId] };
            link.subgraphId = subgraphId;
            return link;
          });
      } else {
        let linkToSubgraphMap: Record<string, string> = {};
        for (let subgraph of Object.values(state.subgraphs)) {
          for (let linkId of subgraph.links) {
            linkToSubgraphMap[linkId] = subgraph.id;
          }
        }
        return Object.values(state.links)
          .filter(link => {
            return state.selectedGraphId === link.graph;
          })
          .map(link => {
            const subgraphId = linkToSubgraphMap[link.id];
            if (subgraphId) {
              link = { ...state.links[link.id] };
              link.subgraphId = subgraphId;
            }
            return link;
          });
      }
    },
  },
  actions: {
    setState(newState: DataModuleState) {
      if (
        Object.keys(newState).length === 0
        || Object.keys(newState.posts).length === 0
      ) {
        return;
      }
      this.graphs = objectMap(Graph.unserialise, newState.graphs);
      this.posts = objectMap(Post.unserialise, newState.posts);
      this.links = objectMap(Link.unserialise, newState.links);
      this.subgraphs = newState.subgraphs == null
        ? {}
        : objectMap(Subgraph.unserialise, newState.subgraphs);
      this.selectedPostIds = newState.selectedPostIds.map(String) || [];
      this.selectedGraphId = String(newState.selectedGraphId) || "1";
      this.selectedSubgraphIds = newState.selectedSubgraphIds.map(String) || [];
      this.zoom = newState.zoom || { x: 0, y: 0, scale: 1 };
    },
    setSelectedPostIds(selectedPostIds: string[]) {
      this.selectedPostIds = selectedPostIds;
    },
    selectPostId({ id, canOpenMultiplePosts }: { id: string; canOpenMultiplePosts: boolean }) {
      if (this.selectedPostIds.includes(id)) {
        this.selectedPostIds.splice(this.selectedPostIds.indexOf(id), 1);
      }
      if (canOpenMultiplePosts) {
        this.selectedPostIds.unshift(id);
      } else {
        this.selectedPostIds = [id];
      }
    },
    unselectPostId(id: string) {
      this.selectedPostIds.splice(this.selectedPostIds.indexOf(id), 1);
    },
    togglePostId({ id, canOpenMultiplePosts }: { id: string; canOpenMultiplePosts: boolean }) {
      if (this.selectedPostIds.includes(id)) {
        this.selectedPostIds.splice(this.selectedPostIds.indexOf(id), 1);
      } else {
        if (canOpenMultiplePosts) {
          this.selectedPostIds.unshift(id);
        } else {
          this.selectedPostIds = [id];
        }
      }
    },
    movePostLeft(id: string) {
      const currentIndex = this.selectedPostIds.indexOf(id);
      const newIndex = currentIndex === 0
        ? this.selectedPostIds.length - 1
        : currentIndex - 1;
      this.selectedPostIds = arrayMove(this.selectedPostIds, currentIndex, newIndex);
    },
    movePostRight(id: string) {
      const currentIndex = this.selectedPostIds.indexOf(id);
      const newIndex = currentIndex === (this.selectedPostIds.length - 1)
        ? 0
        : currentIndex + 1;
      this.selectedPostIds = arrayMove(this.selectedPostIds, currentIndex, newIndex);
    },
    setSelectedGraphId(selectedGraphId: string) {
      this.selectedSubgraphIds = [];
      this.selectedGraphId = selectedGraphId;
    },
    setSelectedSubgraphIds(selectedSubgraphIds: string[]) {
      this.selectedSubgraphIds = selectedSubgraphIds;
    },
    selectAllSubgraphs() {
      this.selectedSubgraphIds = this.graphs[this.selectedGraphId!]?.subgraphs || [];
    },
    toggleSubgraphId(subgraphId: string) {
      if (this.selectedSubgraphIds.includes(subgraphId)) {
        this.selectedSubgraphIds.splice(this.selectedSubgraphIds.indexOf(subgraphId), 1);
      } else {
        this.selectedSubgraphIds.push(subgraphId);
      }
    },
    setZoom(zoom: Zoom) {
      this.zoom = zoom;
    },
  },
});

// Create actions for sub-modules
// Using class-based approach for consistency