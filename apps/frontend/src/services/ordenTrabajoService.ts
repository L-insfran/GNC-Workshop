import type {
  IOrdenTrabajo,
  CreateOrdenTrabajoDTO,
  UpdateOrdenEstadoDTO,
  ITipoTrabajo,
  IPaginationParams,
} from '@gnc/shared-types'
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/services/api-client'

export const ordenTrabajoService = {
  list(params?: IPaginationParams) {
    return apiGet<IOrdenTrabajo[]>('/ordenes-trabajo', params)
  },

  getById(id: string) {
    return apiGet<IOrdenTrabajo>(`/ordenes-trabajo/${id}`)
  },

  create(data: CreateOrdenTrabajoDTO) {
    return apiPost<IOrdenTrabajo>('/ordenes-trabajo', data)
  },

  update(id: string, data: Partial<CreateOrdenTrabajoDTO>) {
    return apiPut<IOrdenTrabajo>(`/ordenes-trabajo/${id}`, data)
  },

  updateEstado(id: string, data: UpdateOrdenEstadoDTO) {
    return apiPatch<IOrdenTrabajo>(`/ordenes-trabajo/${id}/estado`, data)
  },

  remove(id: string) {
    return apiDelete<void>(`/ordenes-trabajo/${id}`)
  },

  getTiposTrabajo() {
    return apiGet<ITipoTrabajo[]>('/tipos-trabajo')
  },
}
