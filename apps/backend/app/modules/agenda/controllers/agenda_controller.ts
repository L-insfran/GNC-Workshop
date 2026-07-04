import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'

export default class AgendaController {
  async index({ response }: HttpContext) {
    return response.ok(
      ApiResponse.success({
        message: 'Módulo Agenda - implementación pendiente Fase 7',
        status: 'planned',
      })
    )
  }
}
