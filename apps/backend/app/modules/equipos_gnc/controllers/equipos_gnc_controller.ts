import type { HttpContext } from '@adonisjs/core/http'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import EquipoGncService from '#modules/equipos_gnc/services/equipo_gnc_service'
import { createEquipoGncValidator } from '#modules/equipos_gnc/validators/create_equipo_gnc_validator'
import { updateEquipoGncValidator } from '#modules/equipos_gnc/validators/update_equipo_gnc_validator'

const equipoGncService = new EquipoGncService()

export default class EquiposGncController {
  async index({ request, response }: HttpContext) {
    const params: IPaginationParams = {
      page: Number(request.input('page', 1)),
      perPage: Number(request.input('perPage', 20)),
      search: request.input('search'),
      sortBy: request.input('sortBy'),
      sortOrder: request.input('sortOrder'),
    }

    const result = await equipoGncService.list(params)
    return response.ok(ApiResponse.paginated(result.data, result.meta as never))
  }

  async show({ params, response }: HttpContext) {
    const equipo = await equipoGncService.getById(params.id)
    if (!equipo) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Equipo GNC no encontrado'))
    }
    return response.ok(ApiResponse.success(equipo))
  }

  async ficha({ params, response }: HttpContext) {
    const ficha = await equipoGncService.getFichaOperativa(params.id)
    if (!ficha) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Equipo GNC no encontrado'))
    }
    return response.ok(ApiResponse.success(ficha))
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createEquipoGncValidator)

    try {
      const equipo = await equipoGncService.create(dto, auth.user!)
      return response.created(ApiResponse.created(equipo))
    } catch (error) {
      return this.handleBusinessError(error, response)
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateEquipoGncValidator)

    try {
      const equipo = await equipoGncService.update(params.id, dto, auth.user!)

      if (!equipo) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Equipo GNC no encontrado'))
      }

      return response.ok(ApiResponse.success(equipo))
    } catch (error) {
      return this.handleBusinessError(error, response)
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    const deleted = await equipoGncService.delete(params.id, auth.user!)
    if (!deleted) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Equipo GNC no encontrado'))
    }
    return response.ok(ApiResponse.success({ message: 'Equipo GNC eliminado' }))
  }

  private handleBusinessError(error: unknown, response: HttpContext['response']) {
    if (error instanceof Error) {
      if (error.message === 'MAX_CILINDROS_EXCEDIDO') {
        return response.badRequest(
          ApiResponse.error(
            'MAX_CILINDROS_EXCEDIDO',
            'Un equipo GNC no puede tener más de 4 cilindros'
          )
        )
      }
      if (error.message === 'VEHICULO_NO_ENCONTRADO') {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Vehículo no encontrado'))
      }
      if (error.message === 'CILINDROS_REQUERIDOS') {
        return response.badRequest(
          ApiResponse.error('CILINDROS_REQUERIDOS', 'Debés agregar al menos un cilindro')
        )
      }
      if (error.message === 'SERIE_EQUIPO_DUPLICADA') {
        return response.conflict(
          ApiResponse.error(
            'SERIE_EQUIPO_DUPLICADA',
            'Ya existe un equipo activo con ese número de serie'
          )
        )
      }
      if (error.message === 'SERIE_CILINDRO_DUPLICADA') {
        return response.conflict(
          ApiResponse.error(
            'SERIE_CILINDRO_DUPLICADA',
            'Ya existe un cilindro activo con ese número de serie'
          )
        )
      }
      if (error.message === 'SERIE_DUPLICADA') {
        return response.conflict(
          ApiResponse.error(
            'SERIE_DUPLICADA',
            'Ya existe un equipo o cilindro activo con ese número de serie'
          )
        )
      }
      if (error.message.startsWith('FECHA_INVALIDA:')) {
        return response.badRequest(
          ApiResponse.error('FECHA_INVALIDA', 'Hay una fecha inválida en el formulario')
        )
      }

      return response.internalServerError(
        ApiResponse.error('INTERNAL_ERROR', error.message || 'Error interno al guardar el equipo')
      )
    }

    return response.internalServerError(
      ApiResponse.error('INTERNAL_ERROR', 'Error interno al guardar el equipo')
    )
  }
}
