import type {
  IFactura,
  CreateFacturaDTO,
  IPaginationParams,
  IFacturaBorradorPreview,
} from '@gnc/shared-types'
import { apiGet, apiPatch, apiPost } from '@/services/api-client'

export const facturaService = {
  list(params?: IPaginationParams) {
    return apiGet<IFactura[]>('/facturas', params)
  },

  getById(id: string) {
    return apiGet<IFactura>(`/facturas/${id}`)
  },

  getNotaCreditoBorrador(id: string) {
    return apiGet<IFacturaBorradorPreview>(`/facturas/${id}/nota-credito-borrador`)
  },

  create(data: CreateFacturaDTO) {
    return apiPost<IFactura>('/facturas', data)
  },

  anular(id: string) {
    return apiPatch<IFactura>(`/facturas/${id}/anular`, {})
  },
}
