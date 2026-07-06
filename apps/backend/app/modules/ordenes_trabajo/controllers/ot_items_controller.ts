import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'
import { serializeOtItem } from '#shared/ot_item_serializer'
import OtItemService from '#modules/ordenes_trabajo/services/ot_item_service'
import { createOtItemValidator } from '#modules/ordenes_trabajo/validators/create_ot_item_validator'
import { updateOtItemValidator } from '#modules/ordenes_trabajo/validators/update_ot_item_validator'

const otItemService = new OtItemService()

const ERROR_MESSAGES: Record<string, [string, string]> = {
  OT_NO_ENCONTRADA: ['OT_NO_ENCONTRADA', 'Orden de trabajo no encontrada'],
  OT_ITEMS_BLOQUEADOS: [
    'OT_ITEMS_BLOQUEADOS',
    'No se pueden modificar ítems en el estado actual de la orden',
  ],
  PRODUCTO_INVALIDO: ['PRODUCTO_INVALIDO', 'Producto inválido o inactivo'],
  PRODUCTO_TIPO_INVALIDO: [
    'PRODUCTO_TIPO_INVALIDO',
    'Solo repuestos y materiales pueden vincularse a un producto',
  ],
  DESCRIPCION_REQUERIDA: ['DESCRIPCION_REQUERIDA', 'La descripción es obligatoria'],
}

function mapError(error: unknown) {
  if (error instanceof Error) {
    const mapped = ERROR_MESSAGES[error.message]
    if (mapped) {
      return ApiResponse.error(mapped[0], mapped[1])
    }
  }
  return null
}

export default class OtItemsController {
  async index({ params, response }: HttpContext) {
    const presupuesto = await otItemService.getPresupuesto(params.id)
    if (!presupuesto) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Orden de trabajo no encontrada'))
    }
    return response.ok(ApiResponse.success(presupuesto))
  }

  async store({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createOtItemValidator)

    try {
      const item = await otItemService.create(params.id, dto, auth.user!)
      return response.created(ApiResponse.created(serializeOtItem(item)))
    } catch (error) {
      const mapped = mapError(error)
      if (mapped) return response.badRequest(mapped)
      throw error
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateOtItemValidator)

    try {
      const item = await otItemService.update(params.id, params.itemId, dto, auth.user!)
      if (!item) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Ítem no encontrado'))
      }
      return response.ok(ApiResponse.success(serializeOtItem(item)))
    } catch (error) {
      const mapped = mapError(error)
      if (mapped) return response.badRequest(mapped)
      throw error
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    try {
      const deleted = await otItemService.delete(params.id, params.itemId, auth.user!)
      if (!deleted) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Ítem no encontrado'))
      }
      return response.ok(ApiResponse.success({ message: 'Ítem eliminado' }))
    } catch (error) {
      const mapped = mapError(error)
      if (mapped) return response.badRequest(mapped)
      throw error
    }
  }
}
