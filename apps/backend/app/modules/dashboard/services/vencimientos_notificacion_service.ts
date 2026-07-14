import type { IVencimientoAlerta } from '@gnc/shared-types'
import DashboardService from '#modules/dashboard/services/dashboard_service'

export interface IVencimientoPendienteNotificar extends IVencimientoAlerta {
  canalSugerido: 'email' | 'whatsapp'
  motivo: string
}

/**
 * Preparación de alertas de vencimiento para notificar a clientes.
 * El envío real (mail/WhatsApp) se cablea en una fase posterior.
 */
export default class VencimientosNotificacionService {
  private dashboardService = new DashboardService()

  async listPendientes(): Promise<IVencimientoPendienteNotificar[]> {
    const vencimientos = await this.dashboardService.getVencimientos()

    return vencimientos
      .filter((alerta) => alerta.nivel === 'warning' || alerta.nivel === 'danger')
      .map((alerta) => ({
        ...alerta,
        canalSugerido: alerta.nivel === 'danger' ? 'whatsapp' : 'email',
        motivo:
          alerta.tipo === 'oblea'
            ? 'Oblea GNC próxima a vencer o vencida'
            : 'Prueba hidráulica próxima a vencer o vencida',
      }))
  }

  /**
   * Ejecución batch (Ace command / job futuro).
   * Hoy solo registra en logger; no envía comunicaciones.
   */
  async procesarAlertas(logger: {
    info: (msg: string, meta?: Record<string, unknown>) => void
    warn: (msg: string, meta?: Record<string, unknown>) => void
  }): Promise<{ total: number; danger: number; warning: number }> {
    const pendientes = await this.listPendientes()
    const danger = pendientes.filter((p) => p.nivel === 'danger').length
    const warning = pendientes.filter((p) => p.nivel === 'warning').length

    logger.info('Vencimientos listos para notificar (stub sin envío)', {
      total: pendientes.length,
      danger,
      warning,
    })

    for (const item of pendientes.slice(0, 20)) {
      logger.warn(`[STUB] Notificar ${item.canalSugerido} → ${item.clienteNombre}`, {
        tipo: item.tipo,
        patente: item.vehiculoPatente,
        diasRestantes: item.diasRestantes,
        equipoGncId: item.equipoGncId,
      })
    }

    return { total: pendientes.length, danger, warning }
  }
}
