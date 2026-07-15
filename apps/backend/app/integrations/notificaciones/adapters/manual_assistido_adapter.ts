import type {
  INotificacionCanalAdapter,
  INotificacionEnvioInput,
  INotificacionEnvioResult,
  NotificacionCanal,
  INotificacionDestinatario,
  INotificacionBorrador,
} from '#integrations/notificaciones/contracts/notificacion_canal_contract'
import { buildMailtoUrl, buildWhatsappUrl, normalizePhoneE164 } from '#integrations/notificaciones/utils/phone_utils'

/**
 * Adapter $0: prepara deep links. No envía nada por API.
 * El operador abre WhatsApp/correo y luego marca "notificado" en el sistema.
 */
export default class ManualAssistidoAdapter implements INotificacionCanalAdapter {
  readonly driver = 'manual' as const
  readonly envioAutomaticoDisponible = false

  prepararBorrador(input: {
    destinatario: INotificacionDestinatario
    canal: NotificacionCanal
    asunto: string
    mensaje: string
  }): INotificacionBorrador {
    const phone = normalizePhoneE164(input.destinatario.telefono)
    const email = input.destinatario.email?.trim() || null

    if (input.canal === 'whatsapp') {
      return {
        canal: 'whatsapp',
        destino: phone,
        asunto: input.asunto,
        mensaje: input.mensaje,
        whatsappUrl: phone ? buildWhatsappUrl(phone, input.mensaje) : null,
        mailtoUrl: null,
      }
    }

    return {
      canal: 'email',
      destino: email,
      asunto: input.asunto,
      mensaje: input.mensaje,
      whatsappUrl: null,
      mailtoUrl: email ? buildMailtoUrl(email, input.asunto, input.mensaje) : null,
    }
  }

  async enviar(_input: INotificacionEnvioInput): Promise<INotificacionEnvioResult> {
    return {
      success: true,
      modo: 'asistido',
      requiereAccionManual: true,
      providerMessageId: null,
    }
  }
}
