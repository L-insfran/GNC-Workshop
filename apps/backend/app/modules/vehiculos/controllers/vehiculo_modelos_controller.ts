import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'
import VehiculoModeloService from '#modules/vehiculos/services/vehiculo_modelo_service'
import {
  createVehiculoModeloValidator,
  updateVehiculoModeloValidator,
} from '#modules/vehiculos/validators/vehiculo_modelo_validator'

const modeloService = new VehiculoModeloService()

export default class VehiculoModelosController {
  async index({ request, response }: HttpContext) {
    const marcaId = request.input('marcaId')
    const modelos = await modeloService.list(marcaId)
    return response.ok(ApiResponse.success(modelos))
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createVehiculoModeloValidator)
    try {
      const modelo = await modeloService.create(dto, auth.user!)
      return response.created(ApiResponse.created(modelo))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateVehiculoModeloValidator)
    try {
      const modelo = await modeloService.update(params.id, dto, auth.user!)
      if (!modelo) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Modelo no encontrado'))
      }
      return response.ok(ApiResponse.success(modelo))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    try {
      const deleted = await modeloService.delete(params.id, auth.user!)
      if (!deleted) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Modelo no encontrado'))
      }
      return response.ok(ApiResponse.success({ message: 'Modelo eliminado' }))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  private handleError(error: unknown, response: HttpContext['response']) {
    if (error instanceof Error) {
      if (error.message === 'NOMBRE_DUPLICADO') {
        return response.conflict(
          ApiResponse.error('NOMBRE_DUPLICADO', 'Ya existe un modelo con ese nombre para la marca')
        )
      }
      if (error.message === 'MARCA_NO_ENCONTRADA') {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Marca no encontrada'))
      }
      if (error.message === 'EN_USO') {
        return response.conflict(
          ApiResponse.error('EN_USO', 'No se puede eliminar: el modelo tiene vehículos asociados')
        )
      }
    }
    throw error
  }
}
