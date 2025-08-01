/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Global type helper
type Nullable<T> = T | null

// D3 event types
declare global {
  interface Window {
    d3: any
  }
}