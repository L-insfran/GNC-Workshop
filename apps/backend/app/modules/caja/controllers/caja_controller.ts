import type { HttpContext } from '@adonisjs/core/http'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import CajaService from '#modules/caja/services/caja_service'
import { createMovimientoValidator } from '#modules/caja/validators/create_movimiento_validator'

const cajaService = new CajaService()

export default class CajaController {
  async index({ response }: HttpContext) {
    const saldo = await cajaService.getSaldo()
    return response.ok(ApiResponse.success(saldo))
  }

  async saldo({ request, response }: HttpContext) {
    const saldo = await cajaService.getSaldo(request.input('cajaId'))
    return response.ok(ApiResponse.success(saldo))
  }

  async movimientos({ request, response }: HttpContext) {
    const params: IPaginationParams & { cajaId?: string } = {
      page: Number(request.input('page', 1)),
      perPage: Number(request.input('perPage', 20)),
      search: request.input('search'),
      cajaId: request.input('cajaId'),
    }

    try {
      const result = await cajaService.listMovimientos(params)
      return response.ok(ApiResponse.paginated(result.data, result.meta))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async storeMovimiento({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createMovimientoValidator)
    try {
      const movimiento = await cajaService.createMovimiento(dto, auth.user!)
      return response.created(ApiResponse.created(movimiento))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async arqueo({ request, response }: HttpContext) {
    try {
      const arqueo = await cajaService.arqueo(request.input('fecha'), request.input('cajaId'))
      return response.ok(ApiResponse.success(arqueo))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  private handleError(error: unknown, response: HttpContext['response']) {
    if (error instanceof Error) {
      if (error.message === 'CAJA_NO_ENCONTRADA') {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Caja no encontrada'))
      }
      if (error.message === 'SALDO_INSUFICIENTE') {
        return response.badRequest(
          ApiResponse.error('SALDO_INSUFICIENTE', 'Saldo insuficiente para el egreso')
        )
      }
      if (error.message === 'COBRO_EXCEDE_TOTAL') {
        return response.badRequest(
          ApiResponse.error('COBRO_EXCEDE_TOTAL', 'El monto supera el saldo pendiente de la factura')
        )
      }
      if (error.message === 'MONTO_COBRO_INVALIDO') {
        return response.badRequest(
          ApiResponse.error('MONTO_COBRO_INVALIDO', 'El monto del cobro debe ser mayor a cero')
        )
      }
      if (error.message === 'FACTURA_NO_ENCONTRADA') {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Factura no encontrada'))
      }
      if (error.message === 'FACTURA_NO_EMITIDA') {
        return response.badRequest(
          ApiResponse.error('FACTURA_NO_EMITIDA', 'Solo se puede cobrar una factura emitida')
        )
      }
      if (
        'code' in error &&
        (error as { code?: string }).code === '23505' &&
        String((error as { constraint?: string }).constraint ?? '').includes(
          'caja_movimientos_factura_ingreso'
        )
      ) {
        return response.badRequest(
          ApiResponse.error(
            'COBRO_UNICO_LEGACY',
            'La base de datos no permite cobros parciales. Ejecutá: npm run migration:run en el backend.'
          )
        )
      }
    }
    throw error
  }
}
