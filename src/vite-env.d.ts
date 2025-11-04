/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Help TS server resolve 'vue' module types in some IDEs
declare module 'vue' {
  export * from '@vue/runtime-dom'
}
