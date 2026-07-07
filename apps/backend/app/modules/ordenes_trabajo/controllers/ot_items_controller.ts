import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'
import {
  extractPgError,
  isOtItemsInfrastructureError,
} from '#shared/db_error_util'
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
  STOCK_INSUFICIENTE_OT_ITEM: [
    'STOCK_INSUFICIENTE_OT_ITEM',
    'Stock insuficiente para la cantidad solicitada (considerando OTs activas)',
  ],
  DESCRIPCION_REQUERIDA: ['DESCRIPCION_REQUERIDA', 'La descripción es obligatoria'],
}

const OT_ITEMS_SIN_MIGRAR_MESSAGE =
  'Falta crear la tabla de presupuesto. Ejecutá: node ace migration:run (o el SQL manual en database/scripts/006_create_ot_items_manual.sql)'

function mapBusinessError(error: unknown) {
  if (error instanceof Error) {
    const mapped = ERROR_MESSAGES[error.message]
    if (mapped) {
      return ApiResponse.error(mapped[0], mapped[1])
    }
  }
  return null
}

function mapInfrastructureError(error: unknown) {
  if (isOtItemsInfrastructureError(error)) {
    return ApiResponse.error('OT_ITEMS_SIN_MIGRAR', OT_ITEMS_SIN_MIGRAR_MESSAGE)
  }
  return null
}

function mapUnexpectedError(error: unknown) {
  const infrastructure = mapInfrastructureError(error)
  if (infrastructure) {
    return infrastructure
  }

  const business = mapBusinessError(error)
  if (business) {
    return business
  }

  const { message } = extractPgError(error)
  return ApiResponse.error(
    'INTERNAL_ERROR',
    message || (error instanceof Error ? error.message : 'Error interno al procesar el presupuesto')
  )
}

function resolveHttpStatus(
  error: unknown,
  mapped: ReturnType<typeof ApiResponse.error>
): number {
  if (mapped.error?.code === 'OT_ITEMS_SIN_MIGRAR') {
    return 500
  }

  if (error instanceof Error && ERROR_MESSAGES[error.message]) {
    return 400
  }

  if (mapped.error?.code === 'NOT_FOUND') {
    return 404
  }

  return 500
}

export default class OtItemsController {
  async index({ params, response }: HttpContext) {
    try {
      const presupuesto = await otItemService.getPresupuesto(params.id)
      if (!presupuesto) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Orden de trabajo no encontrada'))
      }
      return response.ok(ApiResponse.success(presupuesto))
    } catch (error) {
      const mapped = mapUnexpectedError(error)
      return response.status(resolveHttpStatus(error, mapped)).send(mapped)
    }
  }

  async store({ params, request, auth, response }: HttpContext) {
    try {
      const dto = await request.validateUsing(createOtItemValidator)
      const item = await otItemService.create(params.id, dto, auth.user!)
      return response.created(ApiResponse.created(serializeOtItem(item)))
    } catch (error) {
      const mapped = mapUnexpectedError(error)
      return response.status(resolveHttpStatus(error, mapped)).send(mapped)
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    try {
      const dto = await request.validateUsing(updateOtItemValidator)
      const item = await otItemService.update(params.id, params.itemId, dto, auth.user!)
      if (!item) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Ítem no encontrado'))
      }
      return response.ok(ApiResponse.success(serializeOtItem(item)))
    } catch (error) {
      const mapped = mapUnexpectedError(error)
      return response.status(resolveHttpStatus(error, mapped)).send(mapped)
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
      const mapped = mapUnexpectedError(error)
      return response.status(resolveHttpStatus(error, mapped)).send(mapped)
    }
  }
}
