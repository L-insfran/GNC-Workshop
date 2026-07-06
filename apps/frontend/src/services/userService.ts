import type {
  CreateUserDTO,
  IPaginationParams,
  IUser,
  UpdateUserDTO,
} from '@gnc/shared-types'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client'

export const userService = {
  list(params?: IPaginationParams) {
    return apiGet<IUser[]>('/users', params)
  },

  getById(id: string) {
    return apiGet<IUser>(`/users/${id}`)
  },

  create(data: CreateUserDTO) {
    return apiPost<IUser>('/users', data)
  },

  update(id: string, data: UpdateUserDTO) {
    return apiPut<IUser>(`/users/${id}`, data)
  },

  remove(id: string) {
    return apiDelete<void>(`/users/${id}`)
  },
}
