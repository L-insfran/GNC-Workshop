import type { IDashboardKpi, IVencimientoAlerta, IProduccionDiaria } from '@gnc/shared-types'
import { apiGet } from '@/services/api-client'

export const dashboardService = {
  getKpis() {
    return apiGet<IDashboardKpi>('/dashboard/kpis')
  },

  getVencimientos() {
    return apiGet<IVencimientoAlerta[]>('/dashboard/vencimientos')
  },

  getProduccion(dias = 7) {
    return apiGet<IProduccionDiaria[]>('/dashboard/produccion', { dias })
  },
}
