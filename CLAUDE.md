# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spiderweb is an offline-first graph-based note-taking application where users create posts, organize them into graphs, and link them together. The core functionality is primarily implemented in JavaScript/TypeScript using Vue.js 2.x with Vuex.

**Core Architecture:**
- **Frontend**: Vue.js 2.x with Vuex state management and D3.js visualization
- **Build System**: Webpack + Gulp for asset compilation  
- **Storage**: Local Storage with optional Firebase backup
- **Testing**: Jest for JavaScript unit tests

## Development Commands

### Primary Development Workflow
```bash
# Install dependencies
npm install

# Development build with watch mode (primary command)
npm run dev

# Watch for file changes
npm run watch

# Production build
npm run prod

# Build CSS assets
gulp

# Run JavaScript tests
npm test
```

## Core JavaScript Architecture

### Vuex Store Structure (`resources/assets/js/src/offline/store/`)

**Main Store (`index.js`)**:
- Combines all modules with root-level app state (`loadingApp`, `failedToLoadData`, `isRenderingGraph`)
- Handles data persistence to localStorage and Firebase
- Auto-saves state changes via store subscriber
- Manages import/export of application state

**Data Module (`modules/dataModule.ts`)**:
- Central hub combining all domain modules (posts, graphs, links, subgraphs)
- Manages selections (`selectedPostIds`, `selectedGraphId`, `selectedSubgraphIds`)
- Controls zoom state for graph visualization
- Handles complex cross-entity relationships and data integrity

**Domain Modules (`modules/dataModules/`)**:
- `posts.ts`: Post CRUD operations, neighbor calculations, relationship queries
- `graphs.ts`: Graph management with node positions
- `links.ts`: Link creation/deletion between posts
- `subgraphs.ts`: Colored/named subsets of posts and links within graphs

### Data Model Classes (`offline/store/classes/`)

**Core Entities**:
- `Post.ts`: Simple data structure (id, title, body, timestamps)
- `Graph.ts`: Contains posts array, node positions, and subgraphs array
- `Link.ts`: Directed connection between posts within a graph
- `Subgraph.ts`: Named subset of posts/links with color

**Key Relationships**:
- Posts exist independently and can belong to multiple graphs
- Links exist within graphs and automatically add source/target posts to graphs
- Subgraphs are collections within graphs
- Deleting entities cascades to remove references (posts → links → subgraphs)

### Component Structure (`commonComponents/`)

**Primary Components**:
- `OfflineApp.vue`: Main application container
- `Viewer/Viewer.vue`: Graph visualization with D3.js integration
- `Posts/PostEditor.vue`: Post creation/editing interface
- `Graphs/GraphEditor.vue`: Graph management interface
- `Links/LinkEditor.vue`: Link creation between posts

**Data Flow Pattern**:
- Components dispatch Vuex actions
- Actions commit mutations to update state
- State changes trigger automatic persistence
- D3.js reads from computed getters for visualization

### Type System (`@types/StoreTypes.ts`)

Comprehensive TypeScript definitions for:
- Entity IDs as branded strings (`PostId`, `GraphId`, etc.)
- Maps for efficient lookups (`PostsMap`, `GraphsMap`, etc.)  
- State interfaces with serialization variants
- Zoom and position coordinates for D3.js

### Testing Strategy

**Jest Tests (`__tests__/store/`)**:
- Focus on Vuex store modules (posts, graphs, links, subgraphs)
- Test data integrity and cascading operations
- Validate state serialization/deserialization
- Mock state provided in `state.js`

## Key Patterns to Follow

### State Management
- All data mutations go through Vuex commits
- Use namespaced modules (`dataModule/createPost`)
- Leverage getters for computed relationships (`postsInSelectedSubgraphs`)
- Maintain referential integrity across entities

### Component Communication  
- Use `$root.$emit()` for global events (zoom, refresh)
- Dispatch actions for data changes
- Map getters/actions with Vuex helpers

### Data Persistence
- Auto-save triggers on most mutations via store subscriber
- Debounced Firebase sync (250ms delay)
- Full state serialization for export/import

## Known Issues

- **D3 Re-rendering**: Graph doesn't update when data changes outside Viewer tab - use "⟳" refresh button
- **Mobile Focusing**: Post focusing works on desktop/portrait but not landscape phones
- **State Synchronization**: Post-width changes don't update indicators until manual scroll

## Development Notes

- Most functionality is in `resources/assets/js/src/` - the Laravel backend is minimal
- Entry point is `OfflineRoot.vue` which loads state and renders `OfflineApp.vue`
- D3.js integration happens in Viewer component with complex node/link calculations
- Firebase config is optional - app works fully offline by default