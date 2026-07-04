import type { HttpContext } from '@adonisjs/core/http'
import VehiculoMarca from '#models/vehiculo_marca'
import { ApiResponse } from '#shared/api_response'

export default class VehiculoMarcasController {
  async index({ response }: HttpContext) {
    const marcas = await VehiculoMarca.query().orderBy('nombre', 'asc')
    return response.ok(ApiResponse.success(marcas))
  }
}
