import type {
  IDashboardKpi,
  IAlertaOperativa,
  IVencimientoAlerta,
  IVencimientoPendienteNotificar,
  INotificacionDriverInfo,
  IRegistrarVencimientoNotificacionDTO,
  IProduccionDiaria,
} from '@gnc/shared-types'
import { apiGet, apiPost } from '@/services/api-client'

export const dashboardService = {
  getKpis() {
    return apiGet<IDashboardKpi>('/dashboard/kpis')
  },

  getVencimientos() {
    return apiGet<IVencimientoAlerta[]>('/dashboard/vencimientos')
  },

  getPendientesNotificar() {
    return apiGet<IVencimientoPendienteNotificar[]>(
      '/dashboard/vencimientos/pendientes-notificar'
    )
  },

  getNotificacionesConfig() {
    return apiGet<INotificacionDriverInfo>('/dashboard/notificaciones/config')
  },

  marcarNotificado(alertaId: string, data: IRegistrarVencimientoNotificacionDTO) {
    return apiPost<{
      id: string
      alertaId: string
      canal: string
      modo: string
      estado: string
      notificadoAt: string
    }>(`/dashboard/vencimientos/${encodeURIComponent(alertaId)}/marcar-notificado`, data)
  },

  getAlertasOperativas() {
    return apiGet<IAlertaOperativa[]>('/dashboard/alertas-operativas')
  },

  getProduccion(dias = 7) {
    return apiGet<IProduccionDiaria[]>('/dashboard/produccion', { dias })
  },
}
