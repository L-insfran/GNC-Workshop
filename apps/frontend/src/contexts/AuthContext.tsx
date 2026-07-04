import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { IAuthUser, RoleName } from '@gnc/shared-types'
import { authService } from '@/services/authService'
import { ApiError, getAuthToken } from '@/services/api-client'
import { hasRole } from '@/constants/roles'

interface IAuthContextValue {
  user: IAuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkRole: (allowedRoles: RoleName[]) => boolean
}

export const AuthContext = createContext<IAuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<IAuthUser | null>(() => authService.getStoredUser())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getAuthToken()

    if (!token) {
      setIsLoading(false)
      return
    }

    authService
      .me()
      .then(setUser)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          authService.clearSession()
        }
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const checkRole = useCallback(
    (allowedRoles: RoleName[]) => {
      if (!user) return false
      return hasRole(user.role, allowedRoles)
    },
    [user],
  )

  const value = useMemo<IAuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      checkRole,
    }),
    [user, isLoading, login, logout, checkRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
