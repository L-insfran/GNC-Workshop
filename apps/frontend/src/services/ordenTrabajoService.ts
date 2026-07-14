import type {
  IOrdenTrabajo,
  IOrdenTrabajoListParams,
  CreateOrdenTrabajoDTO,
  UpdateOrdenEstadoDTO,
  RegistrarOtSenaDTO,
  ITipoTrabajo,
  IFacturaBorradorPreview,
  IFacturaVinculadaOT,
  IOtEstadoHistorial,
} from '@gnc/shared-types'
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/services/api-client'

export const ordenTrabajoService = {
  list(params?: IOrdenTrabajoListParams) {
    const query = params
      ? {
          ...params,
          mis: params.mis ? '1' : undefined,
        }
      : undefined
    return apiGet<IOrdenTrabajo[]>('/ordenes-trabajo', query)
  },

  getById(id: string) {
    return apiGet<IOrdenTrabajo>(`/ordenes-trabajo/${id}`)
  },

  getHistorial(id: string) {
    return apiGet<IOtEstadoHistorial[]>(`/ordenes-trabajo/${id}/historial`)
  },

  getFacturaBorrador(id: string) {
    return apiGet<IFacturaBorradorPreview>(`/ordenes-trabajo/${id}/factura-borrador`)
  },

  getFacturaVinculada(id: string) {
    return apiGet<IFacturaVinculadaOT | null>(`/ordenes-trabajo/${id}/factura-vinculada`)
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

  registrarSena(id: string, data: RegistrarOtSenaDTO) {
    return apiPost<IOrdenTrabajo>(`/ordenes-trabajo/${id}/sena`, data)
  },

  remove(id: string) {
    return apiDelete<void>(`/ordenes-trabajo/${id}`)
  },

  getTiposTrabajo() {
    return apiGet<ITipoTrabajo[]>('/tipos-trabajo')
  },
}
