import type { HttpContext } from '@adonisjs/core/http'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import FacturaService from '#modules/facturacion/services/factura_service'
import { createFacturaValidator } from '#modules/facturacion/validators/create_factura_validator'

const facturaService = new FacturaService()

const ERROR_MESSAGES: Record<string, [string, string]> = {
  CLIENTE_NO_ENCONTRADO: ['NOT_FOUND', 'Cliente no encontrado'],
  ITEMS_REQUERIDOS: ['ITEMS_REQUERIDOS', 'La factura debe tener al menos un ítem'],
  FACTURA_NO_ENCONTRADA: ['NOT_FOUND', 'Factura no encontrada'],
  FACTURA_YA_ANULADA: ['FACTURA_YA_ANULADA', 'La factura ya está anulada'],
  OT_YA_FACTURADA: ['OT_YA_FACTURADA', 'Esta orden de trabajo ya tiene una factura activa vinculada'],
  FACTURA_REFERENCIA_REQUERIDA: [
    'FACTURA_REFERENCIA_REQUERIDA',
    'La nota de crédito debe referenciar una factura original',
  ],
  FACTURA_REFERENCIA_NO_ENCONTRADA: [
    'FACTURA_REFERENCIA_NO_ENCONTRADA',
    'La factura de referencia no existe',
  ],
  FACTURA_NO_EMITIDA: [
    'FACTURA_NO_EMITIDA',
    'Solo se puede operar sobre facturas en estado emitida',
  ],
  NC_DESDE_NC_NO_PERMITIDA: [
    'NC_DESDE_NC_NO_PERMITIDA',
    'No se puede emitir nota de crédito desde otra nota de crédito',
  ],
  NC_YA_EMITIDA: ['NC_YA_EMITIDA', 'Ya existe una nota de crédito para esta factura'],
  CLIENTE_NC_INVALIDO: [
    'CLIENTE_NC_INVALIDO',
    'El cliente de la nota de crédito debe coincidir con la factura original',
  ],
  FACTURA_CON_COBRO: [
    'FACTURA_CON_COBRO',
    'No se puede anular una factura que ya tiene un cobro registrado en caja',
  ],
  FACTURA_CON_NC: [
    'FACTURA_CON_NC',
    'No se puede anular una factura que tiene una nota de crédito emitida',
  ],
}

export default class FacturacionController {
  async index({ request, response }: HttpContext) {
    const params: IPaginationParams = {
      page: Number(request.input('page', 1)),
      perPage: Number(request.input('perPage', 20)),
      search: request.input('search'),
      sortBy: request.input('sortBy'),
      sortOrder: request.input('sortOrder'),
    }

    const result = await facturaService.list(params)
    return response.ok(ApiResponse.paginated(result.data, result.meta as never))
  }

  async show({ params, response }: HttpContext) {
    const factura = await facturaService.getById(params.id)
    if (!factura) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Factura no encontrada'))
    }
    return response.ok(ApiResponse.success(factura))
  }

  async notaCreditoBorrador({ params, response }: HttpContext) {
    try {
      const borrador = await facturaService.getNotaCreditoBorrador(params.id)
      if (!borrador) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Factura no encontrada'))
      }
      return response.ok(ApiResponse.success(borrador))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createFacturaValidator)
    try {
      const factura = await facturaService.create(dto, auth.user!)
      return response.created(ApiResponse.created(factura))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async anular({ params, auth, response }: HttpContext) {
    try {
      const factura = await facturaService.anular(params.id, auth.user!)
      return response.ok(ApiResponse.success(factura))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  private handleError(error: unknown, response: HttpContext['response']) {
    if (error instanceof Error) {
      const mapped = ERROR_MESSAGES[error.message]
      if (mapped) {
        const status = mapped[0] === 'NOT_FOUND' ? 404 : 400
        if (status === 404) {
          return response.notFound(ApiResponse.error(mapped[0], mapped[1]))
        }
        return response.badRequest(ApiResponse.error(mapped[0], mapped[1]))
      }
    }
    throw error
  }
}
