import type {
  IVehiculo,
  IVehiculoFichaOperativa,
  CreateVehicleDTO,
  UpdateVehicleDTO,
  IPaginationParams,
  IVehiculoMarca,
  IVehiculoModelo,
  CreateVehiculoMarcaDTO,
  UpdateVehiculoMarcaDTO,
  CreateVehiculoModeloDTO,
  UpdateVehiculoModeloDTO,
} from '@gnc/shared-types'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client'

export const vehiculoService = {
  list(params?: IPaginationParams) {
    return apiGet<IVehiculo[]>('/vehiculos', params)
  },

  getById(id: string) {
    return apiGet<IVehiculo>(`/vehiculos/${id}`)
  },

  getFicha(id: string) {
    return apiGet<IVehiculoFichaOperativa>(`/vehiculos/${id}/ficha`)
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

  createMarca(data: CreateVehiculoMarcaDTO) {
    return apiPost<IVehiculoMarca>('/vehiculo-marcas', data)
  },

  updateMarca(id: string, data: UpdateVehiculoMarcaDTO) {
    return apiPut<IVehiculoMarca>(`/vehiculo-marcas/${id}`, data)
  },

  removeMarca(id: string) {
    return apiDelete<void>(`/vehiculo-marcas/${id}`)
  },

  createModelo(data: CreateVehiculoModeloDTO) {
    return apiPost<IVehiculoModelo>('/vehiculo-modelos', data)
  },

  updateModelo(id: string, data: UpdateVehiculoModeloDTO) {
    return apiPut<IVehiculoModelo>(`/vehiculo-modelos/${id}`, data)
  },

  removeModelo(id: string) {
    return apiDelete<void>(`/vehiculo-modelos/${id}`)
  },
}
