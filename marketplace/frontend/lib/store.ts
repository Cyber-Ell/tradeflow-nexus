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
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    set({ user: null, token: null })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
}))

export const initializeAuth = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  
  if (token && user) {
    useAuthStore.setState({
      token,
      user: JSON.parse(user),
    })
  }
}