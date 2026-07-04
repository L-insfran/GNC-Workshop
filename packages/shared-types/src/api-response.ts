export interface IApiResponse<T> {
  success: boolean
  data?: T
  error?: IApiError
  meta?: IPaginationMeta
}

export interface IApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export interface IPaginationMeta {
  page: number
  perPage: number
  total: number
  lastPage: number
}

export interface IPaginationParams {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
