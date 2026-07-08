import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'
import OtControlCalidadService from '#modules/ordenes_trabajo/services/ot_control_calidad_service'
import { upsertOtControlCalidadValidator } from '#modules/ordenes_trabajo/validators/upsert_ot_control_calidad_validator'

const otControlCalidadService = new OtControlCalidadService()

export default class OtControlCalidadController {
  async show({ params, response }: HttpContext) {
    const registro = await otControlCalidadService.getByOrdenTrabajoId(params.id)
    return response.ok(ApiResponse.success(registro))
  }

  async upsert({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(upsertOtControlCalidadValidator)

    try {
      const registro = await otControlCalidadService.upsert(params.id, dto, auth.user!)
      return response.ok(ApiResponse.success(registro))
    } catch (error) {
      if (error instanceof Error) {
        const messages: Record<string, [string, string]> = {
          OT_NO_ENCONTRADA: ['NOT_FOUND', 'Orden de trabajo no encontrada'],
          OT_ESTADO_INVALIDO_QC: [
            'OT_ESTADO_INVALIDO_QC',
            'El checklist solo puede completarse cuando la OT está en control de calidad',
          ],
        }
        const mapped = messages[error.message]
        if (mapped) {
          if (mapped[0] === 'NOT_FOUND') {
            return response.notFound(ApiResponse.error(mapped[0], mapped[1]))
          }
          return response.badRequest(ApiResponse.error(mapped[0], mapped[1]))
        }
      }
      throw error
    }
  }
}
