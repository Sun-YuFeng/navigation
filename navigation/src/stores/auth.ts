// TypeScript declarations for auth.js

declare module '@/stores/auth.js' {
  import type { StoreDefinition } from 'pinia'
  
  interface User {
    id: string
    username: string
    displayName: string
    email: string
  }
  
  interface AuthStore {
    user: User | null
    isLoading: boolean
    initializeAuth: () => Promise<void>
    signIn: (username: string, password: string) => Promise<void>
    signOut: () => void
    signUp: (username: string, password: string, email: string) => Promise<void>
  }
  
  export const useAuthStore: StoreDefinition<string, AuthStore>
}