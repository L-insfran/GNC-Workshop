import type { HttpContext } from '@adonisjs/core/http'
import type { IPaginationParams } from '@gnc/shared-types'
import Vehiculo from '#models/vehiculo'
import { ApiResponse } from '#shared/api_response'
import { serializeVehiculos } from '#shared/vehiculo_serializer'
import ClienteService from '#modules/clientes/services/cliente_service'
import { createClienteValidator } from '#modules/clientes/validators/create_cliente_validator'
import { updateClienteValidator } from '#modules/clientes/validators/update_cliente_validator'

const clienteService = new ClienteService()

export default class ClientesController {
  async index({ request, response }: HttpContext) {
    const params: IPaginationParams = {
      page: Number(request.input('page', 1)),
      perPage: Number(request.input('perPage', 20)),
      search: request.input('search'),
      sortBy: request.input('sortBy'),
      sortOrder: request.input('sortOrder'),
    }

    const result = await clienteService.list(params)
    return response.ok(ApiResponse.paginated(result.data, result.meta as never))
  }

  async show({ params, response }: HttpContext) {
    const cliente = await clienteService.getById(params.id)
    if (!cliente) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Cliente no encontrado'))
    }
    return response.ok(ApiResponse.success(cliente))
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createClienteValidator)

    try {
      const cliente = await clienteService.create(dto, auth.user!)
      return response.created(ApiResponse.created(cliente))
    } catch (error) {
      if (error instanceof Error && error.message === 'DOCUMENTO_DUPLICADO') {
        return response.conflict(
          ApiResponse.error('DOCUMENTO_DUPLICADO', 'Ya existe un cliente con ese documento')
        )
      }
      throw error
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateClienteValidator)
    const cliente = await clienteService.update(params.id, dto, auth.user!)
    if (!cliente) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Cliente no encontrado'))
    }
    return response.ok(ApiResponse.success(cliente))
  }

  async destroy({ params, auth, response }: HttpContext) {
    const deleted = await clienteService.delete(params.id, auth.user!)
    if (!deleted) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Cliente no encontrado'))
    }
    return response.ok(ApiResponse.success({ message: 'Cliente eliminado' }))
  }

  async vehiculos({ params, response }: HttpContext) {
    const cliente = await clienteService.getById(params.id)
    if (!cliente) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Cliente no encontrado'))
    }

    const vehiculos = await Vehiculo.query()
      .where('cliente_id', params.id)
      .whereNull('deleted_at')
      .preload('marca')
      .preload('modelo')
      .orderBy('created_at', 'desc')

    return response.ok(ApiResponse.success(serializeVehiculos(vehiculos)))
  }
}
