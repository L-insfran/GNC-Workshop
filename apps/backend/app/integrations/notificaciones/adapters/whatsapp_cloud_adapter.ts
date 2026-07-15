import notificacionesConfig from '#config/notificaciones'
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
 * Adapter futuro: WhatsApp Cloud API (Meta).
 *
 * Hoy: valida configuración y falla con código claro.
 * Mañana: reemplazar el cuerpo de `enviar()` con el POST a Graph API
 * sin cambiar services de dominio ni el comando Ace.
 *
 * Vars requeridas:
 * - NOTIFICACION_DRIVER=whatsapp_cloud
 * - WHATSAPP_CLOUD_TOKEN
 * - WHATSAPP_CLOUD_PHONE_NUMBER_ID
 */
export default class WhatsappCloudAdapter implements INotificacionCanalAdapter {
  readonly driver = 'whatsapp_cloud' as const

  get envioAutomaticoDisponible(): boolean {
    const { token, phoneNumberId } = notificacionesConfig.whatsapp
    return Boolean(token && phoneNumberId)
  }

  prepararBorrador(input: {
    destinatario: INotificacionDestinatario
    canal: NotificacionCanal
    asunto: string
    mensaje: string
  }): INotificacionBorrador {
    const phone = normalizePhoneE164(input.destinatario.telefono)
    const email = input.destinatario.email?.trim() || null

    // Mientras no hay envío real, seguimos ofreciendo wa.me como fallback asistido
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

  async enviar(input: INotificacionEnvioInput): Promise<INotificacionEnvioResult> {
    if (!this.envioAutomaticoDisponible) {
      return {
        success: false,
        modo: 'automatico',
        requiereAccionManual: true,
        errorCode: 'WHATSAPP_NOT_CONFIGURED',
        errorMessage:
          'WhatsApp Cloud no configurado. Definí WHATSAPP_CLOUD_TOKEN y WHATSAPP_CLOUD_PHONE_NUMBER_ID, o usá NOTIFICACION_DRIVER=manual.',
      }
    }

    const to = normalizePhoneE164(input.destinatario.telefono)
    if (!to) {
      return {
        success: false,
        modo: 'automatico',
        requiereAccionManual: true,
        errorCode: 'DESTINO_INVALIDO',
        errorMessage: 'Teléfono del cliente inválido para WhatsApp',
      }
    }

    // Punto de extensión: aquí irá el fetch a
    // POST https://graph.facebook.com/{version}/{phoneNumberId}/messages
    // Body: { messaging_product: 'whatsapp', to, type: 'text', text: { body: mensaje } }
    // Documentación Meta Cloud API — mantener contratos INotificacionEnvioResult.
    void input
    void notificacionesConfig.whatsapp

    return {
      success: false,
      modo: 'automatico',
      requiereAccionManual: true,
      errorCode: 'WHATSAPP_NOT_IMPLEMENTED',
      errorMessage:
        'Adapter WhatsApp Cloud cableado pero el envío HTTP aún no está implementado. Usá modo asistido mientras tanto.',
    }
  }
}
