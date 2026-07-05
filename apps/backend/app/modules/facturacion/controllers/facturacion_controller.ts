import type { HttpContext } from '@adonisjs/core/http'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import FacturaService from '#modules/facturacion/services/factura_service'
import { createFacturaValidator } from '#modules/facturacion/validators/create_factura_validator'

const facturaService = new FacturaService()

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
      if (error.message === 'CLIENTE_NO_ENCONTRADO') {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Cliente no encontrado'))
      }
      if (error.message === 'ITEMS_REQUERIDOS') {
        return response.badRequest(
          ApiResponse.error('ITEMS_REQUERIDOS', 'La factura debe tener al menos un ítem')
        )
      }
      if (error.message === 'FACTURA_NO_ENCONTRADA') {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Factura no encontrada'))
      }
      if (error.message === 'FACTURA_YA_ANULADA') {
        return response.badRequest(
          ApiResponse.error('FACTURA_YA_ANULADA', 'La factura ya está anulada')
        )
      }
    }
    throw error
  }
}
