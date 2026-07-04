import type {
  ICliente,
  CreateClienteDTO,
  UpdateClienteDTO,
  IPaginationParams,
  IVehiculo,
} from '@gnc/shared-types'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client'

export const clienteService = {
  list(params?: IPaginationParams) {
    return apiGet<ICliente[]>('/clientes', params)
  },

  getById(id: string) {
    return apiGet<ICliente>(`/clientes/${id}`)
  },

  create(data: CreateClienteDTO) {
    return apiPost<ICliente>('/clientes', data)
  },

  update(id: string, data: UpdateClienteDTO) {
    return apiPut<ICliente>(`/clientes/${id}`, data)
  },

  remove(id: string) {
    return apiDelete<void>(`/clientes/${id}`)
  },

  getVehiculos(id: string, params?: IPaginationParams) {
    return apiGet<IVehiculo[]>(`/clientes/${id}/vehiculos`, params)
  },
}
