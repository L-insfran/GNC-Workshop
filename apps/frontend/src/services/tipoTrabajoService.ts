import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client'
import type {
  CreateTipoTrabajoDTO,
  ITipoTrabajo,
  UpdateTipoTrabajoDTO,
} from '@gnc/shared-types'

export const tipoTrabajoService = {
  list(includeInactive = false) {
    return apiGet<ITipoTrabajo[]>('/tipos-trabajo', includeInactive ? { includeInactive: 'true' } : undefined)
  },

  create(data: CreateTipoTrabajoDTO) {
    return apiPost<ITipoTrabajo>('/tipos-trabajo', data)
  },

  update(id: string, data: UpdateTipoTrabajoDTO) {
    return apiPut<ITipoTrabajo>(`/tipos-trabajo/${id}`, data)
  },

  deactivate(id: string) {
    return apiDelete<void>(`/tipos-trabajo/${id}`)
  },
}
