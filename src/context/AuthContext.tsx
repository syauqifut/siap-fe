import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { authService } from '@/services/authService'
import { AUTH_TOKEN_KEY } from '@/services/axios'
import type { LoginPayload, User } from '@/types/auth'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clearAuth = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem(AUTH_TOKEN_KEY)) {
        await authService.logout()
      }
    } catch {
      // Token may already be invalid — still clear local session.
    } finally {
      clearAuth()
    }
  }, [clearAuth])

  // useEffect(() => {
  //   setUnauthorizedHandler(() => {
  //     clearAuth()
  //     navigate('/login', { replace: true })
  //   })

  //   return () => setUnauthorizedHandler(null)
  // }, [clearAuth, navigate])

  // useEffect(() => {
  //   const token = localStorage.getItem(AUTH_TOKEN_KEY)

  //   if (!token) {
  //     setIsLoading(false)
  //     return
  //   }

  //   authService
  //     .getCurrentUser()
  //     .then(setUser)
  //     .catch(() => clearAuth())
  //     .finally(() => setIsLoading(false))
  // }, [clearAuth])

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: loggedInUser, token } = await authService.login(payload)

    localStorage.setItem(AUTH_TOKEN_KEY, token)
    setUser(loggedInUser)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: true, // Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
