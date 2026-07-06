import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'
import VehiculoMarcaService from '#modules/vehiculos/services/vehiculo_marca_service'
import {
  createVehiculoMarcaValidator,
  updateVehiculoMarcaValidator,
} from '#modules/vehiculos/validators/vehiculo_marca_validator'

const marcaService = new VehiculoMarcaService()

export default class VehiculoMarcasController {
  async index({ response }: HttpContext) {
    const marcas = await marcaService.list()
    return response.ok(ApiResponse.success(marcas))
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createVehiculoMarcaValidator)
    try {
      const marca = await marcaService.create(dto, auth.user!)
      return response.created(ApiResponse.created(marca))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateVehiculoMarcaValidator)
    try {
      const marca = await marcaService.update(params.id, dto, auth.user!)
      if (!marca) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Marca no encontrada'))
      }
      return response.ok(ApiResponse.success(marca))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    try {
      const deleted = await marcaService.delete(params.id, auth.user!)
      if (!deleted) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Marca no encontrada'))
      }
      return response.ok(ApiResponse.success({ message: 'Marca eliminada' }))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  private handleError(error: unknown, response: HttpContext['response']) {
    if (error instanceof Error) {
      if (error.message === 'NOMBRE_DUPLICADO') {
        return response.conflict(
          ApiResponse.error('NOMBRE_DUPLICADO', 'Ya existe una marca con ese nombre')
        )
      }
      if (error.message === 'EN_USO') {
        return response.conflict(
          ApiResponse.error('EN_USO', 'No se puede eliminar: la marca tiene modelos o vehículos asociados')
        )
      }
    }
    throw error
  }
}
