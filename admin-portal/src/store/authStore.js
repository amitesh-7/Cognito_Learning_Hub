import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
        localStorage.setItem('admin_token', token)
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('admin_token')
      },
      
      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }))
      },
    }),
    {
      name: 'admin-auth-storage',
    }
  )
)
