import type { IAuthResponse, IAuthUser, ILoginDTO } from '@gnc/shared-types'
import { apiGet, apiPost, clearAuthToken, setAuthToken } from '@/services/api-client'

const USER_KEY = 'gnc_auth_user'

export function getStoredUser(): IAuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as IAuthUser
  } catch {
    return null
  }
}

export function setStoredUser(user: IAuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY)
}

export const authService = {
  async login(credentials: ILoginDTO): Promise<IAuthResponse> {
    const response = await apiPost<IAuthResponse>('/auth/login', credentials)

    if (!response.data) {
      throw new Error('Respuesta de login inválida')
    }

    setAuthToken(response.data.token)
    setStoredUser(response.data.user)
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await apiPost<void>('/auth/logout')
    } finally {
      clearAuthToken()
      clearStoredUser()
    }
  },

  async me(): Promise<IAuthUser> {
    const response = await apiGet<IAuthUser>('/auth/me')

    if (!response.data) {
      throw new Error('No se pudo obtener el usuario')
    }

    setStoredUser(response.data)
    return response.data
  },

  getStoredUser,
  clearSession(): void {
    clearAuthToken()
    clearStoredUser()
  },
}
