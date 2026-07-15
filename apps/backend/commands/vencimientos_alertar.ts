import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import VencimientosNotificacionService from '#modules/dashboard/services/vencimientos_notificacion_service'

export default class VencimientosAlertar extends BaseCommand {
  static commandName = 'vencimientos:alertar'
  static description =
    'Procesa vencimientos de oblea/PH: modo asistido (default) o WhatsApp Cloud si está configurado'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const service = new VencimientosNotificacionService()
    const driver = service.getDriverInfo()
    const result = await service.procesarAlertas(this.logger)

    this.logger.info(
      `Driver: ${result.driver} · automático=${driver.envioAutomaticoDisponible ? 'sí' : 'no'}`
    )
    this.logger.info(
      `Procesadas ${result.total} alertas (${result.danger} críticas, ${result.warning} advertencia)`
    )

    if (result.total === 0) {
      this.logger.success('No hay vencimientos pendientes de notificar')
      return
    }

    if (result.requierenManual > 0) {
      this.logger.info(
        `${result.requierenManual} requieren acción asistida en el Dashboard (WhatsApp / email).`
      )
    }
    if (result.automaticosOk > 0) {
      this.logger.success(`${result.automaticosOk} enviadas automáticamente`)
    }
    if (result.fallidos > 0) {
      this.logger.error(`${result.fallidos} fallaron al enviar`)
    }
  }
}
