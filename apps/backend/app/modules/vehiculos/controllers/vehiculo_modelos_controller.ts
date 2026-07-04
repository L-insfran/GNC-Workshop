import type { HttpContext } from '@adonisjs/core/http'
import VehiculoModelo from '#models/vehiculo_modelo'
import { ApiResponse } from '#shared/api_response'

export default class VehiculoModelosController {
  async index({ request, response }: HttpContext) {
    const marcaId = request.input('marcaId')

    const query = VehiculoModelo.query().orderBy('nombre', 'asc')
    if (marcaId) {
      query.where('marca_id', marcaId)
    }

    const modelos = await query
    return response.ok(ApiResponse.success(modelos))
  }
}
