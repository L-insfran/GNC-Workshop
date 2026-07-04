import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'

export default class InventarioController {
  async index({ response }: HttpContext) {
    return response.ok(
      ApiResponse.success({
        message: 'Módulo Inventario - implementación pendiente Fase 7',
        status: 'planned',
      })
    )
  }
}
