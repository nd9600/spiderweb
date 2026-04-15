# Vue 3 + Vite + Pinia + Vitest + Full TypeScript Migration Plan

## Purpose
This document is a full implementation plan for migrating the frontend from:
- Vue 2 + Webpack + Vuex + Jest + partial TypeScript

to:
- Vue 3 + Vite + Pinia + Vitest + fully typed TypeScript

This plan is based on direct review of current source files, especially:
- `resources/assets/js/src/commonComponents/Viewer/OfflineGraph.vue`
- `resources/assets/js/src/offline/store/index.js`
- `resources/assets/js/src/offline/store/modules/*`
- `resources/assets/js/src/commonComponents/**/*`
- `webpack.config.js`, `package.json`, `tsconfig.json`, `resources/views/offline.blade.php`, `app/Helpers/Helper.php`, `app/Console/Commands/MakeOfflineRelease.php`

This plan does **not** perform the migration.

---

## 1. Migration Objectives

1. Replace Vue 2 runtime with Vue 3.
2. Replace Webpack build with Vite build.
3. Replace Vuex modules with Pinia stores.
4. Replace Jest with Vitest.
5. Convert frontend code to TypeScript end-to-end (no JS source in `resources/assets/js/src` except generated/transitional files).
6. Preserve existing feature behavior unless explicitly agreed bug fixes are included.

---

## 2. Constraints and Current-State Observations

1. The app is tightly centered around Vuex mutation cascades for graph/post/link/subgraph invariants.
2. The D3 graph (`OfflineGraph.vue`) is imperative and coupled to Vue lifecycle, store getters, and `$root` event bus.
3. Persistence/autosave behavior is non-trivial:
- localStorage always;
- optional Firebase sync;
- race-avoidance logic around switching storage methods.
4. Backend/offline packaging currently depends on:
- `rev-manifest.json` mapping via `app/Helpers/Helper.php`;
- scripts in `resources/views/offline.blade.php`;
- `offline_release:make` command.
5. Existing store tests are mutation-level and sparse; there are known bugs in current logic that should be consciously handled during migration.

---

## 3. Strategy Choice and Trade-offs

## Recommended Strategy: staged migration in one branch with parity gates

1. First write lots of tests asserting the current behaviour.
2. Then migrate tooling and state architecture with behavior parity checks, running the tests to ensure everything still works.
3. Then migrate components in waves, running the tests to ensure everything still works.
4. Migrate D3 last (high risk).
5. Cut over only after characterization tests and manual scenario checklist pass.

---

## 4. Target Architecture

## 4.1 App boot and module layout

Suggested target layout (incremental):

```txt
resources/assets/js/src/
  offline/
    main.ts
  stores/
    app.store.ts
    data.store.ts
    settings.store.ts
    firebase.store.ts
    clicker.store.ts
  services/
    persistence.ts
    firebaseDbFactory.ts
    eventBus.ts
  types/
    domain.ts
    persistence.ts
  commonComponents/
    ... (migrated Vue 3 SFCs with <script lang="ts">)
```

Vue components must use the Options API, not the Composition API.

## 4.2 State ownership

- `useDataStore` (Pinia): graphs/posts/links/subgraphs + selection + zoom + graph invariants.
- `useSettingsStore`: autosave + layout + sync settings.
- `useFirebaseStore`: Firebase config.
- `useClickerStore`: click mode and ephemeral UI state.
- `useAppStore`: `loadingApp`, `failedToLoadData`, `isRenderingGraph`.
- `services/persistence.ts`: centralized local/Firebase load-save/import logic.

Trade-off:
- Keeping one large `data.store.ts` preserves current mutation coupling and reduces regression risk.
- Splitting into many entity stores improves modularity but raises cross-store transaction complexity.

Recommendation: start with one `data.store.ts`.

---

## 5. Phase-by-Phase Execution Plan

## Phase 0: Baseline freeze and safety net

1. Snapshot current behavior with a manual scenario checklist.
2. Port existing Jest store tests to Vitest-compatible tests **before** structural changes.
3. Add characterization tests for missing critical flows:
- storage method switching behavior;
- import settings/data decisions;
- click mode transitions;
- key cascade invariants (delete post/graph/subgraph).

Deliverable:
- baseline tests passing under current code (Jest or temporary dual runner).


## Phase 1: Tooling scaffold (Vite + Vue 3 + TS + Vitest)

1. Install and configure:
- `vue@^3`
- `@vitejs/plugin-vue`
- `vite`
- `pinia`
- `vitest`
- `@vue/test-utils@2`
- `jsdom`
- `vue-tsc`
2. Keep old build scripts temporarily during transition (`npm run dev:webpack` fallback).
3. Add Vite config with manifest output for Laravel/offline packaging.

Example `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/assets/js'),
    },
  },
  build: {
    outDir: 'public',
    emptyOutDir: false,
    manifest: 'vite-manifest.json',
    rollupOptions: {
      input: {
        offline_graph: resolve(__dirname, 'resources/assets/js/src/offline/main.ts'),
      },
      output: {
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: 'assets/[ext]/[name].[hash][extname]',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['resources/assets/js/__tests__/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

4. Update TS config for Vue 3 + Vitest globals.

Example `tsconfig.frontend.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "allowJs": false,
    "isolatedModules": true,
    "jsx": "preserve",
    "baseUrl": "./resources/assets/js",
    "paths": {
      "@/*": ["*"]
    },
    "types": ["vitest/globals", "node"]
  },
  "include": [
    "resources/assets/js/src/**/*.ts",
    "resources/assets/js/src/**/*.vue",
    "resources/assets/js/__tests__/**/*.ts"
  ]
}
```

5. Script updates in `package.json`.

Example:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "vue-tsc --noEmit -p tsconfig.frontend.json",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Trade-offs:
- Dual-tooling period adds temporary complexity.
- Avoids risky one-step cutover.

## Phase 2: Vue 3 boot and root wiring

1. Create `resources/assets/js/src/offline/main.ts`.
2. Replace Vue 2 bootstrap with Vue 3 app creation.
3. Mount Pinia and root component.

Example:

```ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import OfflineRoot from './OfflineRoot.vue';

const app = createApp(OfflineRoot);
app.use(createPinia());
app.mount('#offlineGraphApp');
```

4. Convert `OfflineRoot.vue` and `OfflineApp.vue` to `<script lang="ts">`.
5. Preserve initial behavior: load state on mount before showing main tabs.

Trade-off:
- Keep Options API for early migration stability.
- Later optional move to Composition API.

## Phase 3: Store migration Vuex -> Pinia (core of migration)

1. Migrate data first:
- port entity classes and types from `src/offline/store/classes/*.ts` + `src/@types/StoreTypes.ts`.
- create `useDataStore` with typed state/getters/actions.
2. Move Vuex mutations to Pinia actions, preserving cascade semantics.
3. Explicitly decide bug policy for known current defects.

Recommended policy:
- fix clearly unintended defects during migration with test coverage.

Critical known defects to address while porting:
1. `removeGraph` does not delete the graph entry.
2. `removePostFromGraph` filter bug empties subgraph nodes.
3. `PostAttacher` object/array mismatch.
4. `LinkEditor` stale prop/watch mismatch.
5. `setState` rejects valid empty datasets.

Example Pinia store skeleton:

```ts
import { defineStore } from 'pinia';
import type { DataModuleState, GraphId, PostId, SubgraphId, Zoom } from '@/src/types/domain';

export const useDataStore = defineStore('data', {
  state: (): DataModuleState => ({
    graphs: {},
    posts: {},
    links: {},
    subgraphs: {},
    selectedPostIds: [],
    selectedGraphId: '1',
    selectedSubgraphIds: [],
    zoom: { x: 200, y: 100, scale: 0.5 },
  }),
  getters: {
    subgraphsInSelectedGraph: (state) => {
      const graph = state.graphs[state.selectedGraphId!];
      return graph ? graph.subgraphs.map((id) => state.subgraphs[id]) : [];
    },
  },
  actions: {
    setZoom(zoom: Zoom) {
      this.zoom = zoom;
    },
    selectPostId(id: PostId, canOpenMultiplePosts: boolean) {
      const idx = this.selectedPostIds.indexOf(id);
      if (idx >= 0) this.selectedPostIds.splice(idx, 1);
      this.selectedPostIds = canOpenMultiplePosts ? [id, ...this.selectedPostIds] : [id];
    },
  },
});
```

4. Migrate settings/firebase/clicker/app stores similarly.
5. Replace all `mapState/mapGetters/mapMutations/mapActions` usages in components.

Trade-offs:
- Store-first migration gives cleaner component migration path.
- Temporary adapters may be needed for unchanged components.

## Phase 4: Persistence service extraction and parity

1. Move logic from `store/index.js` actions and subscriber into a typed service:
- `saveStateToLocalStorage`
- `saveStateToStorage`
- `loadStateFromStorage`
- `loadDataFrom(source)`
- `importState` / `importData` / `importSettings`
2. Keep debounce behavior for Firebase autosave.
3. Keep race-avoidance semantics when switching to Firebase.

Example persistence autosave wiring:

```ts
import debounce from 'lodash/debounce';
import { watch } from 'vue';
import { useDataStore } from '@/src/stores/data.store';
import { useSettingsStore } from '@/src/stores/settings.store';
import { useFirebaseStore } from '@/src/stores/firebase.store';

export function installPersistence() {
  const data = useDataStore();
  const settings = useSettingsStore();
  const firebase = useFirebaseStore();

  const saveFirebase = debounce((payload: string) => {
    if (settings.remoteStorageMethod !== 'firebase') return;
    // write payload to firebase ref(STORAGE_KEY)
  }, 250);

  watch(
    () => ({ data: data.$state, settings: settings.$state, firebase: firebase.$state }),
    (storageObject) => {
      if (!settings.shouldAutosave) return;
      const payload = JSON.stringify(storageObject);
      localStorage.setItem('offlineState', payload);
      saveFirebase(payload);
    },
    { deep: true }
  );
}
```

Trade-off:
- Deep watches are simple but can be expensive.
- Action-triggered persistence is more efficient but easier to miss edge cases.

Recommendation:
- Start deep watch for parity; optimize later if needed.

## Phase 5: Component migration waves

Migrate in this order:
1. low-risk utility screens: `Graphs/*`, `Settings.vue`, `LoadSave.vue`, `BlogpostExporter/*`.
2. post/link editing components.
3. `Viewer.vue`, `PostBar/*`, `FloatingActionButton.vue`.
4. `OfflineGraph.vue` last.

Guidelines for each component:
1. Convert to `<script lang="ts">`.
2. Add typed props/emits.
3. Replace Vuex helpers with Pinia store access.
4. Remove reliance on implicit `this.$store` typing.
5. Preserve template structure first; refactor UX later.

Example typed props/emits pattern:

```ts
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { PostSerialised } from '@/src/types/domain';

export default defineComponent({
  name: 'PostEditor',
  props: {
    post: {
      type: Object as PropType<PostSerialised>,
      required: true,
    },
  },
  emits: ['removed'],
});
</script>
```

Trade-off:
- Options API minimizes code churn.
- Composition API yields better type inference and testability.

Recommendation:
- Keep Options API where stable; use Composition API in new complex modules (D3 + persistence).

## Phase 6: Replace `$root` event bus with typed event bus or store actions

Current coupling:
- `OfflineGraph.vue`, `Viewer.vue`, and post card components communicate via `$root.$emit/$on`.

Vue 3 has no built-in event bus API.

Option A: typed `mitt` bus.
Option B: direct store-driven commands (`focusTargetPostId`, `shouldRefreshGraph` tokens).

Recommendation: Option B for long-term maintainability; Option A as short transitional layer.

Transitional `mitt` example:

```ts
import mitt from 'mitt';

type AppEvents = {
  focusOnPost: { id: string; speed?: number };
  highlightPost: { id: string };
  unhighlightPost: { id: string };
  refreshGraph: undefined;
  zoomIn: undefined;
  zoomOut: undefined;
};

export const eventBus = mitt<AppEvents>();
```

Component teardown requirement:
- register in `onMounted`, unregister in `onBeforeUnmount`.

## Phase 7: D3 graph migration (`OfflineGraph.vue`)

This is highest-risk and should happen after Pinia + basic component migration.

Tasks:
1. Convert script to TS with typed D3 node/link models.
2. Replace deprecated/global event assumptions with explicit event arguments.
3. Keep the same simulation constants and zoom formulas initially.
4. Preserve node position persistence behavior.
5. Ensure lifecycle cleanup:
- remove listeners,
- stop simulation,
- clear transitions/timers.

Suggested structure:
- extract imperative graph logic into `useOfflineGraph.ts` composable.
- keep SFC mostly as view shell + refs.

Composable skeleton:

```ts
import { onMounted, onBeforeUnmount, Ref } from 'vue';

export function useOfflineGraph(svgRef: Ref<SVGSVGElement | null>) {
  let teardown: (() => void) | null = null;

  onMounted(() => {
    if (!svgRef.value) return;
    teardown = initGraph(svgRef.value); // setup d3 selections, zoom, drag, handlers
  });

  onBeforeUnmount(() => {
    teardown?.();
  });
}
```

Trade-offs:
- Keeping existing D3 approach minimizes regression risk.
- Full algorithm refactor now is high risk and out of scope.

## Phase 8: TypeScript completion pass

1. Convert remaining JS files to TS:
- store modules (if any remain), helpers, services.
2. Replace `any` with concrete types.
3. Add shared type modules for:
- storage payload shape,
- click mode enums,
- store action payloads,
- D3 simulation node/link shape.

Example enum migration:

```ts
export const ClickMode = {
  OpenPosts: 'openPosts',
  AddLink: 'addLink',
  ChangeLink: 'changeLink',
  AddPost: 'addPost',
  AttachPostsToGraphs: 'attachPostsToGraphs',
  SearchForPosts: 'searchForPosts',
} as const;

export type ClickMode = typeof ClickMode[keyof typeof ClickMode];
```

4. Enforce type gate in CI/local:
- `npm run typecheck`
- `npm run test`
- `npm run build`

## Phase 9: Vitest migration details

1. Port tests in `resources/assets/js/__tests__/store/*.test.js` to `.test.ts`.
2. Replace Jest globals/APIs where needed.
3. Keep existing state fixtures typed.

Example converted test:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useDataStore } from '@/src/stores/data.store';
import { createPinia, setActivePinia } from 'pinia';

describe('graphs', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('deleting graph removes subgraphs and links', () => {
    const store = useDataStore();
    // seed test data
    store.removeGraph('1');
    expect(Object.keys(store.subgraphs)).toHaveLength(0);
    expect(Object.keys(store.links)).toHaveLength(0);
  });
});
```

4. Add high-value new tests:
- `clicker` interaction state transitions.
- persistence import/export decisions.
- invariants when deleting post/graph/subgraph.

## Phase 10: Laravel/offline release integration with Vite manifest

Current integration depends on `rev-manifest.json` + `Helper::getAssetPath('js/...')`.

Two options:

Option A (recommended): migrate helper to read Vite manifest.
- Update helper to map entry source key -> output file.
- Update Blade to use Vite entry key.

Helper example:

```php
public static function getViteAssetPath(string $entry): string
{
    $manifestPath = base_path() . '/public/vite-manifest.json';
    $manifest = json_decode(file_get_contents($manifestPath), true);
    if (!isset($manifest[$entry]['file'])) {
        return $entry;
    }
    return '/' . $manifest[$entry]['file'];
}
```

Blade example:

```php
<script type="module" src="{{ Helper::getViteAssetPath('resources/assets/js/src/offline/main.ts') }}"></script>
```

Option B: generate legacy `rev-manifest.json` compatibility output.
- Less backend change, more custom build plumbing.

Trade-off:
- Option A is cleaner and standard for Vite.
- Option B reduces PHP template churn short-term.

Also update `MakeOfflineRelease` command to run Vite build and copy resulting `public/assets`/manifest correctly.

## Phase 11: Hardening, parity validation, and cutover

1. Run full manual regression checklist:
- add/edit/delete posts;
- add/edit/delete links;
- graph/subgraph create/remove/rename/color;
- post attach workflows;
- post bar scrolling and focus;
- import/export;
- autosave on/off;
- Firebase local-vs-remote load choices;
- D3 interactions (zoom, drag, highlight, focus).
2. Compare generated offline dist behavior to current release flow.
3. Remove Webpack/Jest/Vuex legacy files after parity confirmation.
4. Update README development instructions.

---

## 6. Detailed Work Breakdown (Task List)

1. Add Vite/Vue3/Pinia/Vitest deps and configs.
2. Add new TS entrypoint and mount path.
3. Create Pinia stores and port state logic.
4. Implement persistence service parity.
5. Convert low-risk components to Vue 3 + TS.
6. Convert viewer/postbar components.
7. Migrate clicker flows.
8. Migrate D3 component and cleanup handlers.
9. Port and expand tests in Vitest.
10. Update Blade/helper/release packaging for Vite manifest.
11. Remove old build/test/state tooling.

---

## 7. Acceptance Criteria

Migration is complete when all are true:
1. `npm run build` produces working assets via Vite.
2. Offline page (`resources/views/offline.blade.php`) loads migrated app.
3. Vuex/Jest/Webpack are no longer required for frontend workflows.
4. All frontend source under `resources/assets/js/src` is TypeScript or Vue SFC with `lang="ts"`.
5. Vitest suite passes and includes legacy parity + new critical flows.
6. Core user workflows are behaviorally equivalent (or documented intentional changes).
7. Offline release command path works with the new manifest/build outputs.

---

## 8. Risk Register and Mitigations

1. D3 interaction regressions.
- Mitigation: migrate last, preserve constants, add targeted interaction tests and manual scripts.
2. Persistence/data-loss regressions.
- Mitigation: characterization tests + phased rollout + explicit import/load test cases.
3. Backend asset path breakage.
- Mitigation: switch helper/Blade in same PR; smoke-test generated offline `dist/index.html`.
4. Hidden dependence on Vue 2 reactivity semantics.
- Mitigation: store-first migration with invariant tests before component rewrite.
5. Runtime performance degradation from deep watches.
- Mitigation: measure and optimize to targeted subscriptions after parity achieved.

---

## 9. Out-of-Scope (for this migration)

1. Visual redesign.
2. D3 algorithm redesign.
3. Firebase SDK modernization beyond what is required for parity.
4. Large-scale domain model changes beyond bug fixes and typing cleanup.

---

## 10. Suggested PR sequencing

1. PR1: Vite/Vitest/TS scaffolding (no runtime change).
2. PR2: Pinia stores + persistence service + test ports.
3. PR3: component migration wave 1 (non-viewer).
4. PR4: viewer/postbar + clicker migration.
5. PR5: D3 component migration + cleanup.
6. PR6: backend manifest integration + release command update.
7. PR7: legacy removal and docs update.

This sequencing keeps each PR reviewable and lowers blast radius.
