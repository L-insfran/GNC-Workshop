import type {
  IVencimientoPendienteNotificar,
  INotificacionDriverInfo,
  IListPendientesNotificarParams,
} from '@gnc/shared-types'
import Cliente from '#models/cliente'
import DashboardService from '#modules/dashboard/services/dashboard_service'
import VencimientoNotificacionRepository from '#modules/dashboard/repositories/vencimiento_notificacion_repository'
import {
  createNotificacionAdapter,
  getNotificacionDriverInfo,
} from '#integrations/notificaciones/notificacion_adapter_factory'
import { buildVencimientoMensaje } from '#integrations/notificaciones/utils/message_templates'
import { normalizePhoneE164 } from '#integrations/notificaciones/utils/phone_utils'
import type { NotificacionCanal } from '#integrations/notificaciones/contracts/notificacion_canal_contract'

/**
 * Orquesta alertas de vencimiento + adapters de notificación.
 * El canal (manual / WhatsApp Cloud) se cambia por config sin tocar este service.
 */
export default class VencimientosNotificacionService {
  private dashboardService = new DashboardService()
  private notificacionRepo = new VencimientoNotificacionRepository()

  getDriverInfo(): INotificacionDriverInfo {
    return getNotificacionDriverInfo()
  }

  async listPendientes(
    opts: IListPendientesNotificarParams = {}
  ): Promise<IVencimientoPendienteNotificar[]> {
    const adapter = createNotificacionAdapter()
    const driverInfo = this.getDriverInfo()
    const vencimientos = await this.dashboardService.getVencimientos()
    let criticos = vencimientos.filter((a) => a.nivel === 'warning' || a.nivel === 'danger')

    if (opts.equipoGncId) {
      criticos = criticos.filter((a) => a.equipoGncId === opts.equipoGncId)
    }

    const yaEnviadas = await this.notificacionRepo.findEnviadasKeys(
      criticos.map((a) => ({ alertaId: a.id, fechaVencimiento: a.fechaVencimiento }))
    )

    const pendientesBase = opts.incluirYaNotificados
      ? criticos
      : criticos.filter((a) => !yaEnviadas.has(`${a.id}|${a.fechaVencimiento}`))

    if (pendientesBase.length === 0) return []

    const clienteIds = [...new Set(pendientesBase.map((a) => a.clienteId))]
    const clientes = await Cliente.query().whereIn('id', clienteIds)
    const clientesById = new Map(clientes.map((c) => [c.id, c]))

    return pendientesBase.map((alerta) => {
      const cliente = clientesById.get(alerta.clienteId)
      const telefono = cliente?.telefono ?? cliente?.telefonoAlt ?? null
      const email = cliente?.email ?? null
      const canalSugerido: NotificacionCanal =
        alerta.nivel === 'danger' && normalizePhoneE164(telefono) ? 'whatsapp' : email ? 'email' : 'whatsapp'

      const { asunto, mensaje, motivo } = buildVencimientoMensaje(alerta)
      const destinatario = {
        clienteId: alerta.clienteId,
        clienteNombre: alerta.clienteNombre,
        telefono,
        email,
      }

      const borradorWhatsapp = adapter.prepararBorrador({
        destinatario,
        canal: 'whatsapp',
        asunto,
        mensaje,
      })
      const borradorEmail = adapter.prepararBorrador({
        destinatario,
        canal: 'email',
        asunto,
        mensaje,
      })

      return {
        ...alerta,
        canalSugerido,
        motivo,
        clienteEmail: email,
        clienteTelefono: telefono,
        asuntoEmail: asunto,
        mensaje,
        whatsappUrl: borradorWhatsapp.whatsappUrl,
        mailtoUrl: borradorEmail.mailtoUrl,
        puedeWhatsapp: Boolean(borradorWhatsapp.whatsappUrl),
        puedeEmail: Boolean(borradorEmail.mailtoUrl),
        modoDriver: driverInfo.driver,
        envioAutomaticoDisponible: driverInfo.envioAutomaticoDisponible,
        yaNotificado: yaEnviadas.has(`${alerta.id}|${alerta.fechaVencimiento}`),
      }
    })
  }

  async marcarNotificado(
    alertaId: string,
    userId: string | null,
    opts: {
      canal: NotificacionCanal
      modo?: 'asistido' | 'automatico'
      estado?: 'enviado' | 'omitido'
    }
  ) {
    const todos = await this.dashboardService.getVencimientos()
    const alerta = todos.find((a) => a.id === alertaId)
    if (!alerta) {
      throw new Error('ALERTA_NO_ENCONTRADA')
    }

    const cliente = await Cliente.find(alerta.clienteId)
    const telefono = cliente?.telefono ?? cliente?.telefonoAlt ?? null
    const email = cliente?.email ?? null
    const { asunto, mensaje } = buildVencimientoMensaje(alerta)
    const adapter = createNotificacionAdapter()
    const borrador = adapter.prepararBorrador({
      destinatario: {
        clienteId: alerta.clienteId,
        clienteNombre: alerta.clienteNombre,
        telefono,
        email,
      },
      canal: opts.canal,
      asunto,
      mensaje,
    })

    const modo = opts.modo ?? (adapter.envioAutomaticoDisponible ? 'automatico' : 'asistido')

    return this.notificacionRepo.create({
      alertaId: alerta.id,
      tipo: alerta.tipo,
      entidadTipo: alerta.entidadTipo,
      entidadId: alerta.entidadId,
      clienteId: alerta.clienteId,
      equipoGncId: alerta.equipoGncId,
      fechaVencimiento: alerta.fechaVencimiento,
      canal: opts.canal,
      modo,
      estado: opts.estado ?? 'enviado',
      destino: borrador.destino,
      mensaje: borrador.mensaje,
      providerMessageId: null,
      notificadoPor: userId,
    })
  }

  /**
   * Batch (Ace / job futuro). Con driver manual solo informa.
   * Con whatsapp_cloud intenta adapter.enviar() cuando esté implementado.
   */
  async procesarAlertas(logger: {
    info: (msg: string, meta?: Record<string, unknown>) => void
    warn: (msg: string, meta?: Record<string, unknown>) => void
  }): Promise<{
    total: number
    danger: number
    warning: number
    driver: string
    automaticosOk: number
    requierenManual: number
    fallidos: number
  }> {
    const adapter = createNotificacionAdapter()
    const pendientes = await this.listPendientes()
    const danger = pendientes.filter((p) => p.nivel === 'danger').length
    const warning = pendientes.filter((p) => p.nivel === 'warning').length

    logger.info('Vencimientos pendientes de notificar', {
      total: pendientes.length,
      danger,
      warning,
      driver: adapter.driver,
      envioAutomaticoDisponible: adapter.envioAutomaticoDisponible,
    })

    let automaticosOk = 0
    let requierenManual = 0
    let fallidos = 0

    for (const item of pendientes) {
      const result = await adapter.enviar({
        alertaId: item.id,
        destinatario: {
          clienteId: item.clienteId,
          clienteNombre: item.clienteNombre,
          telefono: item.clienteTelefono,
          email: item.clienteEmail,
        },
        borrador: {
          canal: item.canalSugerido,
          destino: item.canalSugerido === 'whatsapp' ? item.clienteTelefono : item.clienteEmail,
          asunto: item.asuntoEmail,
          mensaje: item.mensaje,
          whatsappUrl: item.whatsappUrl,
          mailtoUrl: item.mailtoUrl,
        },
      })

      if (result.requiereAccionManual) {
        requierenManual++
        logger.warn(`[ASISTIDO] ${item.canalSugerido} → ${item.clienteNombre}`, {
          alertaId: item.id,
          patente: item.vehiculoPatente,
          whatsappUrl: item.whatsappUrl,
        })
        continue
      }

      if (result.success) {
        automaticosOk++
        await this.notificacionRepo.create({
          alertaId: item.id,
          tipo: item.tipo,
          entidadTipo: item.entidadTipo,
          entidadId: item.entidadId,
          clienteId: item.clienteId,
          equipoGncId: item.equipoGncId,
          fechaVencimiento: item.fechaVencimiento,
          canal: item.canalSugerido,
          modo: 'automatico',
          estado: 'enviado',
          destino: item.canalSugerido === 'whatsapp' ? item.clienteTelefono : item.clienteEmail,
          mensaje: item.mensaje,
          providerMessageId: result.providerMessageId ?? null,
          notificadoPor: null,
        })
      } else {
        fallidos++
        logger.warn(`[FALLO] ${result.errorCode}: ${result.errorMessage}`, {
          alertaId: item.id,
        })
      }
    }

    return {
      total: pendientes.length,
      danger,
      warning,
      driver: adapter.driver,
      automaticosOk,
      requierenManual,
      fallidos,
    }
  }
}
