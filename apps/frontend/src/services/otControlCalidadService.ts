import { apiGet, apiPut } from '@/services/api-client'
import type { IOtControlCalidad, UpsertOtControlCalidadDTO } from '@gnc/shared-types'

export const otControlCalidadService = {
  get(ordenTrabajoId: string) {
    return apiGet<IOtControlCalidad | null>(`/ordenes-trabajo/${ordenTrabajoId}/control-calidad`)
  },

  upsert(ordenTrabajoId: string, data: UpsertOtControlCalidadDTO) {
    return apiPut<IOtControlCalidad>(`/ordenes-trabajo/${ordenTrabajoId}/control-calidad`, data)
  },
}
