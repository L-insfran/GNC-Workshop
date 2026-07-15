import env from '#start/env'

/**
 * Driver de envío de notificaciones a clientes.
 * - manual: UI asistida (wa.me / mailto). Costo $0. Default.
 * - whatsapp_cloud: Meta Cloud API (requiere token; adapter listo para cablear).
 */
const notificacionesConfig = {
  driver: (env.get('NOTIFICACION_DRIVER') ?? 'manual') as 'manual' | 'whatsapp_cloud',
  whatsapp: {
    token: env.get('WHATSAPP_CLOUD_TOKEN') ?? '',
    phoneNumberId: env.get('WHATSAPP_CLOUD_PHONE_NUMBER_ID') ?? '',
    apiVersion: env.get('WHATSAPP_CLOUD_API_VERSION') ?? 'v21.0',
  },
  tallerNombre: env.get('TALLER_NOMBRE') ?? 'GNC Workshop',
}

export default notificacionesConfig
