export type NotificacionCanal = 'whatsapp' | 'email'

export type NotificacionDriver = 'manual' | 'whatsapp_cloud'

export type NotificacionModo = 'asistido' | 'automatico'

export interface INotificacionDestinatario {
  clienteId: string
  clienteNombre: string
  telefono: string | null
  email: string | null
}

export interface INotificacionBorrador {
  canal: NotificacionCanal
  destino: string | null
  asunto: string
  mensaje: string
  /** Deep link wa.me (solo canal whatsapp / modo asistido) */
  whatsappUrl: string | null
  /** Deep link mailto (solo canal email / modo asistido) */
  mailtoUrl: string | null
}

export interface INotificacionEnvioInput {
  alertaId: string
  destinatario: INotificacionDestinatario
  borrador: INotificacionBorrador
}

export interface INotificacionEnvioResult {
  success: boolean
  modo: NotificacionModo
  /** true si el canal aún requiere acción humana (wa.me / mailto) */
  requiereAccionManual: boolean
  providerMessageId?: string | null
  errorCode?: string
  errorMessage?: string
}

/**
 * Puerto de integración: un adapter por proveedor (manual hoy, WhatsApp Cloud mañana).
 * Los services de dominio solo conocen este contrato.
 */
export interface INotificacionCanalAdapter {
  readonly driver: NotificacionDriver
  readonly envioAutomaticoDisponible: boolean

  prepararBorrador(input: {
    destinatario: INotificacionDestinatario
    canal: NotificacionCanal
    asunto: string
    mensaje: string
  }): INotificacionBorrador

  /**
   * Envío batch/automático.
   * En modo manual: no envía; indica requiereAccionManual.
   * En whatsapp_cloud: llama a Meta API cuando esté configurado.
   */
  enviar(input: INotificacionEnvioInput): Promise<INotificacionEnvioResult>
}
