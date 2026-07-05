import type {
  ICajaSaldo,
  ICajaMovimiento,
  IArqueo,
  CreateCajaMovimientoDTO,
  IPaginationParams,
} from '@gnc/shared-types'
import { apiGet, apiPost } from '@/services/api-client'

export const cajaService = {
  saldo(cajaId?: string) {
    return apiGet<ICajaSaldo>('/caja/saldo', cajaId ? { cajaId } : undefined)
  },

  movimientos(params?: IPaginationParams & { cajaId?: string }) {
    return apiGet<ICajaMovimiento[]>('/caja/movimientos', params)
  },

  createMovimiento(data: CreateCajaMovimientoDTO) {
    return apiPost<ICajaMovimiento>('/caja/movimientos', data)
  },

  arqueo(fecha?: string, cajaId?: string) {
    return apiGet<IArqueo>('/caja/arqueo', {
      ...(fecha ? { fecha } : {}),
      ...(cajaId ? { cajaId } : {}),
    })
  },
}
