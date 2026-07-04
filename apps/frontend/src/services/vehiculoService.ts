import type {
  IVehiculo,
  CreateVehicleDTO,
  UpdateVehicleDTO,
  IPaginationParams,
  IVehiculoMarca,
  IVehiculoModelo,
} from '@gnc/shared-types'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client'

export const vehiculoService = {
  list(params?: IPaginationParams) {
    return apiGet<IVehiculo[]>('/vehiculos', params)
  },

  getById(id: string) {
    return apiGet<IVehiculo>(`/vehiculos/${id}`)
  },

  create(data: CreateVehicleDTO) {
    return apiPost<IVehiculo>('/vehiculos', data)
  },

  update(id: string, data: UpdateVehicleDTO) {
    return apiPut<IVehiculo>(`/vehiculos/${id}`, data)
  },

  remove(id: string) {
    return apiDelete<void>(`/vehiculos/${id}`)
  },

  getMarcas() {
    return apiGet<IVehiculoMarca[]>('/vehiculo-marcas')
  },

  getModelos(marcaId?: string) {
    return apiGet<IVehiculoModelo[]>('/vehiculo-modelos', marcaId ? { marcaId } : undefined)
  },
}
