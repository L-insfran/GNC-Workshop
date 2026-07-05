import type { HttpContext } from '@adonisjs/core/http'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import VehiculoService from '#modules/vehiculos/services/vehiculo_service'
import { createVehiculoValidator } from '#modules/vehiculos/validators/create_vehiculo_validator'
import { updateVehiculoValidator } from '#modules/vehiculos/validators/update_vehiculo_validator'

const vehiculoService = new VehiculoService()

export default class VehiculosController {
  async index({ request, response }: HttpContext) {
    const params: IPaginationParams = {
      page: Number(request.input('page', 1)),
      perPage: Number(request.input('perPage', 20)),
      search: request.input('search'),
      sortBy: request.input('sortBy'),
      sortOrder: request.input('sortOrder'),
      ...(request.input('clienteId') ? { clienteId: request.input('clienteId') } : {}),
    }

    const result = await vehiculoService.list(params)
    return response.ok(ApiResponse.paginated(result.data, result.meta as never))
  }

  async show({ params, response }: HttpContext) {
    const vehiculo = await vehiculoService.getById(params.id)
    if (!vehiculo) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Vehículo no encontrado'))
    }
    return response.ok(ApiResponse.success(vehiculo))
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createVehiculoValidator)

    try {
      const vehiculo = await vehiculoService.create(dto, auth.user!)
      return response.created(ApiResponse.created(vehiculo))
    } catch (error) {
      return this.handleBusinessError(error, response)
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateVehiculoValidator)

    try {
      const vehiculo = await vehiculoService.update(params.id, dto, auth.user!)
      if (!vehiculo) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Vehículo no encontrado'))
      }
      return response.ok(ApiResponse.success(vehiculo))
    } catch (error) {
      return this.handleBusinessError(error, response)
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    const deleted = await vehiculoService.delete(params.id, auth.user!)
    if (!deleted) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Vehículo no encontrado'))
    }
    return response.ok(ApiResponse.success({ message: 'Vehículo eliminado' }))
  }

  private handleBusinessError(error: unknown, response: HttpContext['response']) {
    if (error instanceof Error) {
      if (error.message === 'PATENTE_DUPLICADA') {
        return response.conflict(
          ApiResponse.error('PATENTE_DUPLICADA', 'Ya existe un vehículo activo con esa patente')
        )
      }
      if (error.message === 'MODELO_INVALIDO') {
        return response.badRequest(
          ApiResponse.error('MODELO_INVALIDO', 'El modelo no corresponde a la marca seleccionada')
        )
      }
    }
    throw error
  }
}
