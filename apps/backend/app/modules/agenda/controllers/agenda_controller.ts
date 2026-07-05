import type { HttpContext } from '@adonisjs/core/http'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import TurnoService from '#modules/agenda/services/turno_service'
import { createTurnoValidator } from '#modules/agenda/validators/create_turno_validator'
import { updateTurnoValidator } from '#modules/agenda/validators/update_turno_validator'

const turnoService = new TurnoService()

export default class AgendaController {
  async index({ request, response }: HttpContext) {
    const params: IPaginationParams = {
      page: Number(request.input('page', 1)),
      perPage: Number(request.input('perPage', 20)),
      search: request.input('search'),
      sortBy: request.input('sortBy'),
      sortOrder: request.input('sortOrder'),
    }

    const result = await turnoService.list(params)
    return response.ok(ApiResponse.paginated(result.data, result.meta as never))
  }

  async porFecha({ request, response }: HttpContext) {
    const fecha = request.input('fecha')
    if (!fecha) {
      return response.badRequest(ApiResponse.error('VALIDATION_ERROR', 'Fecha requerida'))
    }

    try {
      const turnos = await turnoService.listByFecha(fecha)
      return response.ok(ApiResponse.success(turnos))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async show({ params, response }: HttpContext) {
    const turno = await turnoService.getById(params.id)
    if (!turno) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Turno no encontrado'))
    }
    return response.ok(ApiResponse.success(turno))
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createTurnoValidator)
    try {
      const turno = await turnoService.create(dto, auth.user!)
      return response.created(ApiResponse.created(turno))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateTurnoValidator)
    try {
      const turno = await turnoService.update(params.id, dto, auth.user!)
      if (!turno) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Turno no encontrado'))
      }
      return response.ok(ApiResponse.success(turno))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    const deleted = await turnoService.delete(params.id, auth.user!)
    if (!deleted) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Turno no encontrado'))
    }
    return response.ok(ApiResponse.success({ message: 'Turno eliminado' }))
  }

  private handleError(error: unknown, response: HttpContext['response']) {
    if (error instanceof Error) {
      if (error.message === 'CLIENTE_NO_ENCONTRADO') {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Cliente no encontrado'))
      }
      if (error.message === 'FECHA_INVALIDA') {
        return response.badRequest(ApiResponse.error('FECHA_INVALIDA', 'Fecha u hora inválida'))
      }
      if (error.message === 'TURNO_SOLAPADO') {
        return response.conflict(
          ApiResponse.error('TURNO_SOLAPADO', 'Ya existe un turno en ese horario')
        )
      }
    }
    throw error
  }
}
