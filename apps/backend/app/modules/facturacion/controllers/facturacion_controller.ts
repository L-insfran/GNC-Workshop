import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'

export default class FacturacionController {
  async index({ response }: HttpContext) {
    return response.ok(
      ApiResponse.success({
        message: 'Módulo Facturación - implementación pendiente Fase 7',
        status: 'planned',
      })
    )
  }
}
