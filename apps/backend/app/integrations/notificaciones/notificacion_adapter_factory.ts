import notificacionesConfig from '#config/notificaciones'
import type { INotificacionCanalAdapter } from '#integrations/notificaciones/contracts/notificacion_canal_contract'
import ManualAssistidoAdapter from '#integrations/notificaciones/adapters/manual_assistido_adapter'
import WhatsappCloudAdapter from '#integrations/notificaciones/adapters/whatsapp_cloud_adapter'

export function createNotificacionAdapter(): INotificacionCanalAdapter {
  if (notificacionesConfig.driver === 'whatsapp_cloud') {
    return new WhatsappCloudAdapter()
  }
  return new ManualAssistidoAdapter()
}

export function getNotificacionDriverInfo() {
  const adapter = createNotificacionAdapter()
  return {
    driver: adapter.driver,
    envioAutomaticoDisponible: adapter.envioAutomaticoDisponible,
    tallerNombre: notificacionesConfig.tallerNombre,
  }
}
