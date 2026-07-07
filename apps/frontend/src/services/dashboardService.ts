import type { IDashboardKpi, IAlertaOperativa, IVencimientoAlerta, IProduccionDiaria } from '@gnc/shared-types'
import { apiGet } from '@/services/api-client'

export const dashboardService = {
  getKpis() {
    return apiGet<IDashboardKpi>('/dashboard/kpis')
  },

  getVencimientos() {
    return apiGet<IVencimientoAlerta[]>('/dashboard/vencimientos')
  },

  getAlertasOperativas() {
    return apiGet<IAlertaOperativa[]>('/dashboard/alertas-operativas')
  },

  getProduccion(dias = 7) {
    return apiGet<IProduccionDiaria[]>('/dashboard/produccion', { dias })
  },
}
