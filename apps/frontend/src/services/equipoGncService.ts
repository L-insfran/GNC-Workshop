import type {
  IEquipoGnc,
  IEquipoGncFichaOperativa,
  CreateEquipoGncDTO,
  UpdateEquipoGncDTO,
  IPaginationParams,
} from '@gnc/shared-types'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client'

export const equipoGncService = {
  list(params?: IPaginationParams) {
    return apiGet<IEquipoGnc[]>('/equipos-gnc', params)
  },

  getById(id: string) {
    return apiGet<IEquipoGnc>(`/equipos-gnc/${id}`)
  },

  getFicha(id: string) {
    return apiGet<IEquipoGncFichaOperativa>(`/equipos-gnc/${id}/ficha`)
  },

  create(data: CreateEquipoGncDTO) {
    return apiPost<IEquipoGnc>('/equipos-gnc', data)
  },

  update(id: string, data: UpdateEquipoGncDTO) {
    return apiPut<IEquipoGnc>(`/equipos-gnc/${id}`, data)
  },

  remove(id: string) {
    return apiDelete<void>(`/equipos-gnc/${id}`)
  },
}
