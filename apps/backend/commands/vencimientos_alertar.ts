import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import VencimientosNotificacionService from '#modules/dashboard/services/vencimientos_notificacion_service'

export default class VencimientosAlertar extends BaseCommand {
  static commandName = 'vencimientos:alertar'
  static description =
    'Lista vencimientos de oblea/PH pendientes de notificar (stub sin envío real)'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const service = new VencimientosNotificacionService()
    const result = await service.procesarAlertas(this.logger)

    this.logger.info(
      `Procesadas ${result.total} alertas (${result.danger} críticas, ${result.warning} advertencia)`
    )

    if (result.total === 0) {
      this.logger.success('No hay vencimientos pendientes de notificar')
      return
    }

    this.logger.success(
      'Stub OK. Próximo paso: conectar adapter de email/WhatsApp sin cambiar este comando.'
    )
  }
}
