# Frontend Research Report (`resources/assets/js`)

## Scope
This report is based on a full read-through of every file under `resources/assets/js`, including Vue components, Vuex store modules, TypeScript model/types files, helpers, and Jest tests.

## 1) High-level architecture
The frontend in `resources/assets/js` is a Vue 2 single-page "offline graph editor/viewer" centered around posts (nodes), directed links (edges), graphs (containers), and subgraphs (named/colored subsets).

The runtime path is:
1. `resources/assets/js/src/offline/graph.js` boots Vue 2 and mounts `OfflineRoot` into `#offlineGraphApp`.
2. `resources/assets/js/src/offline/OfflineRoot.vue` loads persisted state via `loadStateFromStorage` on mount.
3. `resources/assets/js/src/commonComponents/OfflineApp.vue` shows loading/failure UI, then a tabbed app shell.
4. Main tabs are `Viewer`, `Graphs`, `LoadSave`, `Settings`.

Primary state authority is the Vuex store in `resources/assets/js/src/offline/store/index.js`.

## 2) File map and responsibilities

### Entry/runtime
- `resources/assets/js/src/offline/graph.js`: Vue 2 app bootstrap.
- `resources/assets/js/src/offline/OfflineRoot.vue`: root wrapper that initializes storage load.
- `resources/assets/js/src/commonComponents/OfflineApp.vue`: app shell with tab navigation and Firebase failure fallback controls.

### Viewer + graph interaction
- `resources/assets/js/src/commonComponents/Viewer/Viewer.vue`: top-level graph controls, graph/subgraph selectors, graph + post bar layout.
- `resources/assets/js/src/commonComponents/Viewer/OfflineGraph.vue`: D3 force graph renderer and interaction engine.
- `resources/assets/js/src/commonComponents/Viewer/FloatingActionButton.vue`: floating contextual action UI for adding/editing posts/links.
- `resources/assets/js/src/commonComponents/Viewer/PostBar/PostBar.vue`: container for open post panels.
- `resources/assets/js/src/commonComponents/Viewer/PostBar/PostBarScrollButtons.vue`: horizontal post navigation logic.
- `resources/assets/js/src/commonComponents/Viewer/PostBar/Post.vue`: post panel, markdown display/editor toggle, linked resources tabs.
- `resources/assets/js/src/commonComponents/Viewer/PostBar/LinkedPosts.vue`: incoming/outgoing linked post listing and link deletion.
- `resources/assets/js/src/commonComponents/Viewer/PostBar/LinkedSubgraphs.vue`: subgraphs for a post and remove-from-subgraph action.
- `resources/assets/js/src/commonComponents/Viewer/PostBar/AddLinkedPost.vue`: create a new post and immediately link it to current post.

### Graph/subgraph management UI
- `resources/assets/js/src/commonComponents/Graphs/Graphs.vue`: create + list graphs.
- `resources/assets/js/src/commonComponents/Graphs/GraphEditor.vue`: rename/remove graph + nested subgraph editor.
- `resources/assets/js/src/commonComponents/Graphs/Subgraphs.vue`: create + list subgraphs in a graph.
- `resources/assets/js/src/commonComponents/Graphs/SubgraphEditor.vue`: rename/recolor/remove subgraph.

### Post/link authoring components
- `resources/assets/js/src/commonComponents/Posts/PostMaker.vue`: create post with optional immediate graph/subgraph attachments.
- `resources/assets/js/src/commonComponents/Posts/PostEditor.vue`: live edit title/body and delete post.
- `resources/assets/js/src/commonComponents/Posts/PostSearch.vue`: client-side post search.
- `resources/assets/js/src/commonComponents/Posts/PostAttacher.vue`: attach existing post to selected graph/subgraphs.
- `resources/assets/js/src/commonComponents/Posts/PostsAttacher.vue`: workflow UI for selecting unattached/search result posts to attach.
- `resources/assets/js/src/commonComponents/Links/LinkAdder.vue`: "add link by clicking two posts" configurator.
- `resources/assets/js/src/commonComponents/Links/LinkEditor.vue`: edit link type/source/target/subgraph membership.

### Import/export/settings
- `resources/assets/js/src/commonComponents/LoadSave.vue`: manual save, JSON import/export, blogpost export section.
- `resources/assets/js/src/commonComponents/Settings/Settings.vue`: autosave toggle, Firebase sync settings, layout settings.
- `resources/assets/js/src/commonComponents/BlogpostExporter/BlogpostExporter.vue`: export selected post/link subset as HTML.
- `resources/assets/js/src/commonComponents/BlogpostExporter/ExportedPost.vue`: HTML rendering for each exported post.

### Store and persistence
- `resources/assets/js/src/offline/store/index.js`: Vuex root store, import/export actions, autosave subscription, Firebase/local storage integration.
- `resources/assets/js/src/offline/store/firebaseDbFactory.js`: Firebase app/database initialization.
- `resources/assets/js/src/offline/store/modules/dataModule.ts`: typed aggregate data module for graphs/posts/links/subgraphs + selection/zoom.
- `resources/assets/js/src/offline/store/modules/dataModules/graphs.ts`: graph-specific mutations.
- `resources/assets/js/src/offline/store/modules/dataModules/posts.ts`: post-specific getters/mutations/actions.
- `resources/assets/js/src/offline/store/modules/dataModules/links.ts`: link-specific getters/mutations.
- `resources/assets/js/src/offline/store/modules/dataModules/subgraphs.ts`: subgraph-specific getters/mutations.
- `resources/assets/js/src/offline/store/modules/clickerModule.js`: interaction mode state machine for click behavior.
- `resources/assets/js/src/offline/store/modules/settingsModule.js`: settings state + storage-method action.
- `resources/assets/js/src/offline/store/modules/firebaseModule.js`: Firebase config state.

### Domain classes/types/helpers
- `resources/assets/js/src/offline/store/classes/Post.ts`, `Graph.ts`, `Link.ts`, `Subgraph.ts`: serializable domain classes.
- `resources/assets/js/src/@types/StoreTypes.ts`: type aliases/interfaces for store entities.
- `resources/assets/js/src/@types/global.d.ts`: global `Nullable<T>` helper type.
- `resources/assets/js/src/helpers/markedCustomised.js`: marked config with outbound links opening in new tab.
- `resources/assets/js/src/helpers/numberHelpers.js`: numeric validation helpers.
- `resources/assets/js/src/helpers/vuexHelpers.js`: deep reactive set/delete helpers for Vue 2 reactivity caveats.
- `resources/assets/js/src/commonComponents/constants.js`: core constants (`WIDTH`, `HEIGHT`, `INITIAL_ZOOM`, `STORAGE_KEY`).
- `resources/assets/js/src/services/AppVars.js`: reads JSON app vars from `#appVars` data attribute (not referenced within this folder).

### Tests
- `resources/assets/js/__tests__/store/*.test.js` + `state.js`: Jest unit tests focused on deletion side-effects in store modules.

## 3) Domain model and invariants
Core concepts:
- `Post`: text content (`title`, `body`, timestamps).
- `Link`: directed edge (`source`, `target`, `type`, belongs to one `graph`).
- `Graph`: named container of `nodes` (`PostId[]`), `subgraphs`, and persistent `nodePositions`.
- `Subgraph`: named/colored subset with its own `nodes` and `links` arrays.

Intended invariants (also documented in comments in `dataModule.ts`):
- Posts can exist unattached.
- Links are graph-scoped and should not exist independently of graph context.
- Deleting posts/graph membership should cascade link and placement cleanup.
- Subgraphs are graph-owned.

ID strategy:
- IDs are effectively stringified integers.
- New IDs are generated as `max(existing numeric ids) + 1` in relevant modules.

## 4) Vuex architecture and data flow

### Root store behavior (`store/index.js`)
- Global flags: `loadingApp`, `failedToLoadData`, `isRenderingGraph`.
- `storageObject` getter bundles `dataModule`, `settingsModule`, `firebaseModule`.
- Save paths:
- `saveStateToLocalStorage`: always local.
- `saveStateToStorage`: local + Firebase (if enabled).
- Load path:
- Reads local storage first.
- Uses local `settingsModule.remoteStorageMethod` to decide whether to fetch Firebase data.
- Firebase load has a timeout-driven error state fallback.
- Import paths:
- `importState`: writes all module states.
- `importData`: data only.
- `importSettings`: settings/firebase config, then optional data-source load if storage method changes.

Autosave subscriber:
- Runs on most mutations when `shouldAutosave=true`.
- Ignores UI-only/global loading and `clickerModule` mutations.
- Skips all `*/setState` hydration mutations.
- Writes local immediately, Firebase via a 250ms debounced helper.

### `dataModule` aggregation (`dataModule.ts`)
Composition model:
- Merges state/getters/mutations/actions from `graphs`, `posts`, `links`, `subgraphs` modules.
- Adds cross-cutting selection and zoom state.
- Adds derived getters for selected graph/subgraph slices and visible nodes/links.

Cross-cutting getters:
- `subgraphsInSelectedGraph`: maps selected graph's subgraph IDs to objects.
- `postIdsInSelectedSubgraphs`: either union of selected subgraph nodes or all nodes in selected graph.
- `postsInSelectedSubgraphs`: maps IDs to posts.
- `linksInSelectedSubgraphs`: returns links visible for current filter; injects `subgraphId` hint onto returned objects for coloring.

Selection behavior:
- Post selection supports single or multi-open mode.
- Toggle/select operations keep ordering (important for post bar order).
- Graph switching clears selected subgraphs.

Hydration behavior:
- `setState` deserializes classes and coerces IDs to strings.
- If incoming state has zero keys or zero posts, `setState` early-returns.

### `posts` module (`dataModules/posts.ts`)
Notable getters:
- `unattachedPosts`: posts not present in any graph nodes array.
- `titleOrBody`: display helper (title first line preferred, else body preview).
- `neighbourIndex` and `isNeighbour`: precomputed adjacency for graph highlight fading.
- `postIdsThatLinkToPost`: returns two maps (`from`, `to`) keyed by link ID.
- `linkedSubgraphs`: all subgraphs containing a post.

Mutations:
- `createPost`, `updatePostTitle`, `updatePostBody`.
- `deletePost` performs broad cascade:
- unselect post,
- remove all links touching that post,
- remove those link IDs from subgraphs,
- remove post from all graphs/subgraphs,
- remove from all graph nodePositions,
- delete post record.

Action:
- `makeNewPost` allocates ID and commits `createPost`.

### `links` module (`dataModules/links.ts`)
Key behavior:
- `addLink` deduplicates exact `(graph, source, target, type)` duplicates.
- Ensures source/target posts are in graph nodes.
- If subgraph IDs supplied, ensures source/target posts are in each subgraph and appends link ID.
- `updateLink` and source/target changes also enforce graph node inclusion.
- `setSubgraphsLinkIsIn` is membership reconciler against full subgraph set.
- `removeLink` removes link ID from all subgraphs then deletes link.

### `graphs` module (`dataModules/graphs.ts`)
Behavior:
- Creates named graphs with unique names.
- Graph deletion intended to:
- null out selection if needed,
- clear selected subgraph IDs that belong to deleted graph,
- delete that graph's subgraphs,
- delete links owned by that graph.
- Graph membership changes (`addPostToGraph`, `removePostFromGraph`) include cascades for links/subgraphs/positions.
- `setPostPosition` stores node coordinates under currently selected graph.

### `subgraphs` module (`dataModules/subgraphs.ts`)
Behavior:
- Creates named subgraphs (globally unique by name) and appends ID to graph's `subgraphs` list.
- `subgraphColour` getter returns stored color or deterministic hash fallback.
- Removing subgraph updates selected IDs and selected graph's subgraph list.
- Adding post to subgraph also ensures post exists in selected graph nodes.
- Removing post from subgraph also removes subgraph links touching that post.

### Interaction state module (`clickerModule.js`)
This is a state machine for click semantics:
- Modes: `openPosts`, `addLink`, `changeLink`, `addPost`, `attachPostsToGraphs`, `searchForPosts` (UI uses this too).
- Keeps transient link-creation/editing state.
- `handlePostClick` dispatches behavior by mode:
- open/select post,
- staged source->target link creation,
- changing source/target for selected link.
- `handleLinkClick` behavior:
- open mode: determines nearer endpoint and returns the opposite node ID to focus.
- change-link mode: sets `linkToEdit`.

### Settings and Firebase modules
- `settingsModule.js`: autosave toggle, storage method, layout percentages, post width, and storage-method change action that can source data from local/Firebase.
- `firebaseModule.js`: stores config object; `setFirebaseConfig` action triggers full reload from storage.

## 5) D3 graph deep dive (`OfflineGraph.vue`)
This is the most complex piece in the folder.

Rendering pipeline:
1. Watchers on selected graph/subgraphs/posts/links trigger `debouncedMakeGraphSvg`.
2. `makeGraphSvg` clones current visible posts/links and preloads fixed node positions from graph state (`node.fx/node.fy`).
3. Builds force simulation with:
- link force (`distance=200`, id by `d.id`),
- charge force (`strength=-7500`),
- center force (`WIDTH/2`, `HEIGHT/2`).
4. Runs `simulation.tick(300)` eagerly.
5. Joins links to `<line>` elements with class-per-type and marker arrowheads.
6. Builds/merges node `<g>` groups with child `<circle>` and `<text>`.
7. Binds click events:
- node/text/circle click -> `clickerModule/handlePostClick` behavior.
- link click -> `clickerModule/handleLinkClick`, possibly followed by focus animation.
8. Tick handler updates line endpoints and node/text coordinates.

Zoom model:
- Uses d3 zoom behavior with extent `[0.025, 2]`.
- Current transform stored in component `zoom`, mirrored to Vuex via debounced `setZoom` after initial mount guard.
- Root `<g>` transform is applied in watcher.
- Zoom watcher also dynamically recalculates:
- text size CSS variable (`--node-text-size`) with dampened upscale formula,
- link/node radius via `--link-stroke-width` and circle `r` attr.

Drag model:
- Node drag behavior restarts simulation with alpha target.
- While dragging one node, all others are temporarily fixed to prevent drift.
- Drag end persists position into `graph.nodePositions` via `setPostPosition`.

Highlight model:
- `highlightPost` uses adjacency (`isNeighbour`) to dim non-neighbor nodes/text/links.
- hovered text is visually emphasized and raised in DOM order.

Focus model:
- `focusOnPost` animates zoom transform to center-ish target with different magic offsets for phone/desktop.
- `zoomIn`/`zoomOut` use transform scaling transitions.

Event bus coupling:
- Subscribes to `$root` events (`focusOnPost`, `highlightPost`, `refreshGraph`, `zoomIn`, `zoomOut`).
- Graph control buttons in `Viewer.vue` and post cards trigger these events.

Performance notes:
- Graph rebuild is debounced (500ms), but still reconstructs selections/simulation frequently.
- Deep cloning via `JSON.parse(JSON.stringify(...))` is used repeatedly.
- Adjacency index helps hover filtering but computed getters still recompute by reactive changes.

## 6) UI behavior details

### Viewer tab
- Graph chooser (`selectedGraphId`) and multi-select subgraph filter (`selectedSubgraphIds`).
- "View all subgraphs" shortcut.
- localStorage size warning (`>2mb`) shown in header.
- Layout heights controlled by settings module (`graphHeight`, `postBarHeight` in `vh`).

### Floating action / click workflows
- Floating `+` opens action menu.
- Contexts include:
- attach existing posts to graph/subgraphs,
- change/remove links,
- add link by clicking source then target,
- add post,
- search posts.
- Menu close resets clicker transient state.

### Post bar
- Selected posts render horizontally in ordered list.
- Scroll button logic computes which cards are fully/partially visible and scrolls to next/prev card boundaries.
- Each post card supports:
- focus in graph,
- markdown rendering,
- inline edit mode,
- close/unselect,
- reorder left/right,
- linked posts panel,
- linked subgraphs panel,
- add-linked-post panel.

### Graphs tab
- Create graph/subgraph with name uniqueness checks.
- Graph editor nested subgraph management.
- Subgraph color picker with persisted hex color.

### Load/save tab
- Manual save if autosave off.
- Import JSON file with checkboxes for data/settings and conditional source-of-truth choice when enabling Firebase sync.
- Export entire storage object as timestamped JSON.
- Blogpost exporter can output selected post/link subset as standalone HTML snippets with link references.

### Settings tab
- Autosave toggle.
- Remote storage method and Firebase config text input.
- Optional conflict decision: keep local or take Firebase data when enabling sync.
- Layout controls for graph/postbar/post width with preview mock.

## 7) Persistence and synchronization behavior
- Source of truth at runtime is Vuex state.
- Autosave writes to localStorage on most mutations.
- Firebase sync is opt-in via `settingsModule.remoteStorageMethod === 'firebase'`.
- Startup load uses local storage first to decide whether to fetch Firebase.
- There is explicit logic to avoid a race where toggling Firebase would autosave stale local data over remote before loading remote.

## 8) TypeScript coverage status
What is typed:
- Data model classes (`Post`, `Link`, `Graph`, `Subgraph`).
- Core store typing (`StoreTypes.ts`, `dataModule.ts`, and data submodules mostly in TS).

What is still untyped JS:
- Most Vue components (`.vue` script blocks are JS).
- Root store (`index.js`), `clickerModule.js`, `settingsModule.js`, `firebaseModule.js`.
- Helpers and several service files.

Current typing approach is partial and not end-to-end strict.

## 9) Test coverage
Jest tests under `resources/assets/js/__tests__/store` are narrow and mutation-level:
- Graph deletion removes links/subgraphs and clears selection.
- Removing posts from graph/posts module removes node positions.
- Link deletion removes subgraph membership.
- Removing post from subgraph removes links in that subgraph.

No tests cover:
- D3 graph rendering logic.
- Click-mode behavior end-to-end.
- Import/export + Firebase async flows.
- Many UI workflows.

## 10) Notable bugs, inconsistencies, and edge cases found
1. `resources/assets/js/src/offline/store/modules/dataModules/graphs.ts`: `removeGraph` does not actually delete `state.graphs[graphId]`.
2. `resources/assets/js/src/offline/store/modules/dataModules/graphs.ts`: `removePostFromGraph` has `subgraph.nodes.filter(postId => postId !== postId)`, which always returns empty and clears all nodes in each affected subgraph.
3. `resources/assets/js/src/commonComponents/Posts/PostAttacher.vue`: in `created`, `this.subgraphIdsToAttachPostTo = this.subgraphsInSelectedGraph[0]` assigns an object, not an ID array.
4. `resources/assets/js/src/commonComponents/Links/LinkEditor.vue`: watcher includes `"subgraphId"` but there is no such data/computed property.
5. `resources/assets/js/src/commonComponents/Links/LinkEditor.vue`: component data copies props once and has commented "fixme" watcher, so prop changes are not synchronized.
6. `resources/assets/js/src/offline/store/modules/dataModule.ts`: `setState` refuses to hydrate if incoming posts are empty, making empty-but-valid imports impossible.
7. `resources/assets/js/src/commonComponents/Viewer/OfflineGraph.vue`: uses global event bus subscriptions with no teardown in `beforeDestroy`.
8. `resources/assets/js/src/commonComponents/Viewer/FloatingActionButton.vue`: link-stroke-width parsing assumes inline style value exists and matches `Npx`; brittle if unset.
9. `resources/assets/js/src/commonComponents/Viewer/OfflineGraph.vue`: mixed direct DOM access + D3 selectors + Vue reactivity increases lifecycle fragility.

## 11) Migration implications (Vue 3 + Vite + Pinia + Vitest + full TS)
This codebase is feasible to migrate, but there is tight coupling between D3 interactions, global event bus usage, and Vuex mutation semantics.

Main migration hotspots:
1. Replace Vue 2 patterns: `Vue.set`, `Vue.delete`, `$root.$on/$emit`, keep-alive/component behavior assumptions.
2. Move Vuex modules to Pinia stores while preserving invariants/cascades.
3. Port D3 code to Vue 3 lifecycle + current D3 event APIs (avoid deprecated `d3event`/`d3mouse` pattern).
4. Convert `.vue` scripts to TypeScript and strongly type store entities and events end-to-end.
5. Replace Jest tests with Vitest and expand test coverage to include interaction/state-machine behavior.

Given current behavior complexity, safest path is:
- first write characterization tests around store invariants and click-mode flows,
- then migrate store/state layer,
- then migrate D3 component and event wiring,
- then migrate build tooling and test runner.

## 12) Summary
`resources/assets/js` implements a sophisticated graph-driven writing tool with substantial non-trivial logic in state cascades, graph rendering, and interaction modes. The D3 component is the critical complexity center. The code already contains meaningful domain structure and partial TS models, but the app is still largely Vue 2 + JS-era in component/store implementation and has a handful of real bugs in state mutations that should be addressed before or during migration.
