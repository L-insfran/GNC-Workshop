import type { CreateOtItemDTO, IOtPresupuestoResumen, IOtItem, UpdateOtItemDTO } from '@gnc/shared-types'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client'

export const otItemService = {
  getPresupuesto(ordenTrabajoId: string) {
    return apiGet<IOtPresupuestoResumen>(`/ordenes-trabajo/${ordenTrabajoId}/items`)
  },

  create(ordenTrabajoId: string, data: CreateOtItemDTO) {
    return apiPost<IOtItem>(`/ordenes-trabajo/${ordenTrabajoId}/items`, data)
  },

  update(ordenTrabajoId: string, itemId: string, data: UpdateOtItemDTO) {
    return apiPut<IOtItem>(`/ordenes-trabajo/${ordenTrabajoId}/items/${itemId}`, data)
  },

  remove(ordenTrabajoId: string, itemId: string) {
    return apiDelete<void>(`/ordenes-trabajo/${ordenTrabajoId}/items/${itemId}`)
  },
}
