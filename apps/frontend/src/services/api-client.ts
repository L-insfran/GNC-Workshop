import type { IApiResponse, IPaginationParams } from '@gnc/shared-types'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api/v1'
const TOKEN_KEY = 'gnc_auth_token'

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function buildQueryString(params?: IPaginationParams & Record<string, string | number | boolean | undefined>): string {
  if (!params) return ''

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

async function handleResponse<T>(response: Response): Promise<IApiResponse<T>> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  const body = isJson ? ((await response.json()) as IApiResponse<T>) : null

  if (!response.ok) {
    const message = body?.error?.message ?? response.statusText ?? 'Error de conexión'
    const code = body?.error?.code ?? 'UNKNOWN_ERROR'
    throw new ApiError(message, code, response.status, body?.error?.details)
  }

  if (!body) {
    throw new ApiError('Respuesta inválida del servidor', 'INVALID_RESPONSE', response.status)
  }

  return body
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  queryParams?: IPaginationParams & Record<string, string | number | boolean | undefined>,
): Promise<IApiResponse<T>> {
  const token = getAuthToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}${buildQueryString(queryParams)}`, {
    ...options,
    headers,
  })

  return handleResponse<T>(response)
}

export async function apiGet<T>(
  endpoint: string,
  queryParams?: IPaginationParams & Record<string, string | number | boolean | undefined>,
): Promise<IApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET' }, queryParams)
}

export async function apiPost<T>(endpoint: string, data?: unknown): Promise<IApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data !== undefined ? JSON.stringify(data) : undefined,
  })
}

export async function apiPut<T>(endpoint: string, data: unknown): Promise<IApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function apiPatch<T>(endpoint: string, data: unknown): Promise<IApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function apiDelete<T>(endpoint: string): Promise<IApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE' })
}
