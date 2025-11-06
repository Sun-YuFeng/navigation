/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '@/supabase.js' {
  import type { SupabaseClient } from '@supabase/supabase-js'
  export const supabase: SupabaseClient
  export function getCurrentUserId(): string
  export function updateSupabaseHeaders(): void
  export function validateUserId(userId: string): Promise<boolean>
}

declare module '@/stores/auth.js' {
  export function useAuthStore(): any
}

