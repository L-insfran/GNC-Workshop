import type { IKitTrabajoItem, CreateKitItemDTO, UpdateKitItemDTO } from '@gnc/shared-types'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client'

export const kitTrabajoService = {
  listByTipo(tipoTrabajoId: string) {
    return apiGet<IKitTrabajoItem[]>(`/kit-trabajos/${tipoTrabajoId}/items`)
  },

  create(tipoTrabajoId: string, data: CreateKitItemDTO) {
    return apiPost<IKitTrabajoItem>(`/kit-trabajos/${tipoTrabajoId}/items`, data)
  },

  update(itemId: string, data: UpdateKitItemDTO) {
    return apiPut<IKitTrabajoItem>(`/kit-trabajos/items/${itemId}`, data)
  },

  remove(itemId: string) {
    return apiDelete<void>(`/kit-trabajos/items/${itemId}`)
  },
}
