import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'
import KitTrabajoService from '#modules/ordenes_trabajo/services/kit_trabajo_service'
import { createKitItemValidator } from '#modules/ordenes_trabajo/validators/create_kit_item_validator'
import { updateKitItemValidator } from '#modules/ordenes_trabajo/validators/update_kit_item_validator'
import { serializeKitTrabajoItem } from '#shared/kit_trabajo_serializer'

const kitTrabajoService = new KitTrabajoService()

export default class KitTrabajoController {
  async index({ params, response }: HttpContext) {
    try {
      const items = await kitTrabajoService.listByTipoTrabajo(params.tipoTrabajoId)
      return response.ok(ApiResponse.success(items))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async store({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createKitItemValidator)
    try {
      const item = await kitTrabajoService.create(params.tipoTrabajoId, dto, auth.user!)
      return response.created(ApiResponse.created(serializeKitTrabajoItem(item)))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateKitItemValidator)
    try {
      const item = await kitTrabajoService.update(params.itemId, dto, auth.user!)
      if (!item) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Ítem de kit no encontrado'))
      }
      return response.ok(ApiResponse.success(serializeKitTrabajoItem(item)))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    try {
      const deleted = await kitTrabajoService.delete(params.itemId, auth.user!)
      if (!deleted) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Ítem de kit no encontrado'))
      }
      return response.ok(ApiResponse.success({ message: 'Ítem de kit eliminado' }))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  private handleError(error: unknown, response: HttpContext['response']) {
    if (error instanceof Error) {
      const messages: Record<string, [string, string, number]> = {
        TIPO_TRABAJO_INVALIDO: ['TIPO_TRABAJO_INVALIDO', 'Tipo de trabajo inválido o inactivo', 400],
        PRODUCTO_REQUERIDO: [
          'PRODUCTO_REQUERIDO',
          'Los repuestos y materiales del kit deben vincularse a un producto',
          400,
        ],
        PRODUCTO_INVALIDO: ['PRODUCTO_INVALIDO', 'Producto inválido o inactivo', 400],
        PRODUCTO_TIPO_INVALIDO: [
          'PRODUCTO_TIPO_INVALIDO',
          'Solo se pueden vincular productos a ítems de tipo repuesto o material',
          400,
        ],
      }
      const mapped = messages[error.message]
      if (mapped) {
        const [code, message, status] = mapped
        if (status === 404) {
          return response.notFound(ApiResponse.error(code, message))
        }
        return response.badRequest(ApiResponse.error(code, message))
      }
    }
    throw error
  }
}
