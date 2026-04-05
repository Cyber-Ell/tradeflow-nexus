import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
  role: 'vendor' | 'wholesaler' | 'admin'
  status?: string
  createdAt?: string
}

export interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  hasHydrated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setHydrated: (hydrated: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  hasHydrated: false,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setHydrated: (hasHydrated) => set({ hasHydrated }),
  logout: () => {
    set({ user: null, token: null, hasHydrated: true })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
}))

export const initializeAuth = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null

  try {
    if (token && user) {
      useAuthStore.setState({
        token,
        user: JSON.parse(user),
        hasHydrated: true,
      })
      return
    }
  } catch (error) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  useAuthStore.setState({
    token: null,
    user: null,
    hasHydrated: true,
  })
}
