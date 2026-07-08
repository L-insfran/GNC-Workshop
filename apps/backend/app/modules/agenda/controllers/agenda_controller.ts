import type { HttpContext } from '@adonisjs/core/http'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import TurnoService from '#modules/agenda/services/turno_service'
import { createTurnoValidator } from '#modules/agenda/validators/create_turno_validator'
import { updateTurnoValidator } from '#modules/agenda/validators/update_turno_validator'
import { serializeTurno, serializeTurnos } from '#shared/turno_serializer'
import { serializeOrdenTrabajo } from '#shared/orden_trabajo_serializer'

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
    return response.ok(ApiResponse.paginated(serializeTurnos(result.data), result.meta as never))
  }

  async porFecha({ request, response }: HttpContext) {
    const fecha = request.input('fecha')
    if (!fecha) {
      return response.badRequest(ApiResponse.error('VALIDATION_ERROR', 'Fecha requerida'))
    }

    try {
      const turnos = await turnoService.listByFecha(fecha)
      return response.ok(ApiResponse.success(serializeTurnos(turnos)))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async show({ params, response }: HttpContext) {
    const turno = await turnoService.getById(params.id)
    if (!turno) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Turno no encontrado'))
    }
    return response.ok(ApiResponse.success(serializeTurno(turno)))
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createTurnoValidator)
    try {
      const turno = await turnoService.create(dto, auth.user!)
      return response.created(ApiResponse.created(serializeTurno(turno)))
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
      return response.ok(ApiResponse.success(serializeTurno(turno)))
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

  async generarOt({ params, auth, response }: HttpContext) {
    try {
      const orden = await turnoService.generarOrdenDesdeTurno(params.id, auth.user!)
      return response.created(ApiResponse.created(serializeOrdenTrabajo(orden)))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  private handleError(error: unknown, response: HttpContext['response']) {
    if (error instanceof Error) {
      const messages: Record<string, [string, string, 'badRequest' | 'notFound' | 'conflict']> = {
        CLIENTE_NO_ENCONTRADO: ['NOT_FOUND', 'Cliente no encontrado', 'notFound'],
        FECHA_INVALIDA: ['FECHA_INVALIDA', 'Fecha u hora inválida', 'badRequest'],
        TURNO_SOLAPADO: ['TURNO_SOLAPADO', 'Ya existe un turno en ese horario', 'conflict'],
        TURNO_NO_ENCONTRADO: ['NOT_FOUND', 'Turno no encontrado', 'notFound'],
        TURNO_CANCELADO: [
          'TURNO_CANCELADO',
          'No se puede generar una OT desde un turno cancelado',
          'badRequest',
        ],
        TURNO_YA_ATENDIDO: [
          'TURNO_YA_ATENDIDO',
          'Este turno ya tiene una orden de trabajo vinculada',
          'badRequest',
        ],
        VEHICULO_REQUERIDO: [
          'VEHICULO_REQUERIDO',
          'El turno debe tener un vehículo asignado para generar la OT',
          'badRequest',
        ],
        TIPO_TRABAJO_REQUERIDO: [
          'TIPO_TRABAJO_REQUERIDO',
          'El turno debe tener un tipo de trabajo para generar la OT',
          'badRequest',
        ],
        TIPO_TRABAJO_INVALIDO: [
          'TIPO_TRABAJO_INVALIDO',
          'Tipo de trabajo inválido o inactivo',
          'badRequest',
        ],
        VEHICULO_INVALIDO: [
          'VEHICULO_INVALIDO',
          'El vehículo no pertenece al cliente indicado',
          'badRequest',
        ],
        OBLEA_VENCIDA: [
          'OBLEA_VENCIDA',
          'No se puede crear la OT: oblea vencida. Solo permitido para renovación de oblea',
          'badRequest',
        ],
        PH_VENCIDA: [
          'PH_VENCIDA',
          'No se puede crear la OT: hay cilindros con PH vencida. Solo permitido para prueba hidráulica o reparación de cilindro',
          'badRequest',
        ],
      }

      const mapped = messages[error.message]
      if (mapped) {
        const [code, message, kind] = mapped
        if (kind === 'notFound') return response.notFound(ApiResponse.error(code, message))
        if (kind === 'conflict') return response.conflict(ApiResponse.error(code, message))
        return response.badRequest(ApiResponse.error(code, message))
      }
    }
    throw error
  }
}
