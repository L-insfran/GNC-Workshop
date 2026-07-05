import type {
  IFactura,
  CreateFacturaDTO,
  IPaginationParams,
} from '@gnc/shared-types'
import { apiGet, apiPatch, apiPost } from '@/services/api-client'

export const facturaService = {
  list(params?: IPaginationParams) {
    return apiGet<IFactura[]>('/facturas', params)
  },

  getById(id: string) {
    return apiGet<IFactura>(`/facturas/${id}`)
  },

  create(data: CreateFacturaDTO) {
    return apiPost<IFactura>('/facturas', data)
  },

  anular(id: string) {
    return apiPatch<IFactura>(`/facturas/${id}/anular`, {})
  },
}
