import type { HttpContext } from '@adonisjs/core/http'
import TipoTrabajo from '#models/tipo_trabajo'
import { ApiResponse } from '#shared/api_response'

export default class TiposTrabajoController {
  async index({ response }: HttpContext) {
    const tipos = await TipoTrabajo.query().where('is_active', true).orderBy('nombre', 'asc')
    return response.ok(ApiResponse.success(tipos))
  }
}
