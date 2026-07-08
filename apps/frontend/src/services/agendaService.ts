import type {
  ITurno,
  IOrdenTrabajo,
  CreateTurnoDTO,
  UpdateTurnoDTO,
  IPaginationParams,
} from '@gnc/shared-types'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client'

export const agendaService = {
  list(params?: IPaginationParams) {
    return apiGet<ITurno[]>('/agenda/turnos', params)
  },

  porFecha(fecha: string) {
    return apiGet<ITurno[]>('/agenda/por-fecha', { fecha })
  },

  getById(id: string) {
    return apiGet<ITurno>(`/agenda/turnos/${id}`)
  },

  create(data: CreateTurnoDTO) {
    return apiPost<ITurno>('/agenda/turnos', data)
  },

  update(id: string, data: UpdateTurnoDTO) {
    return apiPut<ITurno>(`/agenda/turnos/${id}`, data)
  },

  remove(id: string) {
    return apiDelete<void>(`/agenda/turnos/${id}`)
  },

  generarOt(id: string) {
    return apiPost<IOrdenTrabajo>(`/agenda/turnos/${id}/generar-ot`)
  },
}
