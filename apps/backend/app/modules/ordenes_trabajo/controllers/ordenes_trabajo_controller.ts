import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import { serializeOrdenTrabajo, serializeOrdenesTrabajo } from '#shared/orden_trabajo_serializer'
import OrdenTrabajoService from '#modules/ordenes_trabajo/services/orden_trabajo_service'
import { createOrdenTrabajoValidator } from '#modules/ordenes_trabajo/validators/create_orden_trabajo_validator'
import { updateEstadoValidator } from '#modules/ordenes_trabajo/validators/update_estado_validator'

const ordenTrabajoService = new OrdenTrabajoService()

export default class OrdenesTrabajoController {
  async index({ request, response }: HttpContext) {
    const params: IPaginationParams = {
      page: Number(request.input('page', 1)),
      perPage: Number(request.input('perPage', 20)),
      search: request.input('search'),
      sortBy: request.input('sortBy'),
      sortOrder: request.input('sortOrder'),
    }

    const result = await ordenTrabajoService.list(params)
    return response.ok(
      ApiResponse.paginated(serializeOrdenesTrabajo(result.data), result.meta as never)
    )
  }

  async show({ params, response }: HttpContext) {
    const orden = await ordenTrabajoService.getById(params.id)
    if (!orden) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Orden de trabajo no encontrada'))
    }
    return response.ok(ApiResponse.success(serializeOrdenTrabajo(orden)))
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createOrdenTrabajoValidator)

    try {
      const orden = await ordenTrabajoService.create(dto, auth.user!)
      return response.created(ApiResponse.created(serializeOrdenTrabajo(orden)))
    } catch (error) {
      if (error instanceof Error) {
        const messages: Record<string, [string, string]> = {
          VEHICULO_INVALIDO: ['VEHICULO_INVALIDO', 'El vehículo no pertenece al cliente indicado'],
          TIPO_TRABAJO_INVALIDO: ['TIPO_TRABAJO_INVALIDO', 'Tipo de trabajo inválido o inactivo'],
          EQUIPO_INVALIDO: ['EQUIPO_INVALIDO', 'El equipo GNC no pertenece al vehículo indicado'],
          OBLEA_VENCIDA: [
            'OBLEA_VENCIDA',
            'No se puede crear la OT: oblea vencida. Solo permitido para renovación de oblea',
          ],
        }
        const mapped = messages[error.message]
        if (mapped) {
          return response.badRequest(ApiResponse.error(mapped[0], mapped[1]))
        }
      }
      throw error
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createOrdenTrabajoValidator)

    const orden = await ordenTrabajoService.update(
      params.id,
      {
        clienteId: dto.clienteId,
        vehiculoId: dto.vehiculoId,
        equipoGncId: dto.equipoGncId ?? null,
        tipoTrabajoId: dto.tipoTrabajoId,
        prioridad: dto.prioridad ?? 'normal',
        fechaEstimadaEntrega: dto.fechaEstimadaEntrega
          ? DateTime.fromISO(dto.fechaEstimadaEntrega)
          : null,
        mecanicoAsignadoId: dto.mecanicoAsignadoId ?? null,
        kilometrajeIngreso: dto.kilometrajeIngreso ?? null,
        descripcionProblema: dto.descripcionProblema ?? null,
        observacionesInternas: dto.observacionesInternas ?? null,
      },
      auth.user!
    )
    if (!orden) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Orden de trabajo no encontrada'))
    }
    return response.ok(ApiResponse.success(serializeOrdenTrabajo(orden)))
  }

  async destroy({ params, auth, response }: HttpContext) {
    const deleted = await ordenTrabajoService.delete(params.id, auth.user!)
    if (!deleted) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Orden de trabajo no encontrada'))
    }
    return response.ok(ApiResponse.success({ message: 'Orden de trabajo eliminada' }))
  }

  async updateEstado({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateEstadoValidator)

    try {
      const orden = await ordenTrabajoService.updateEstado(params.id, dto, auth.user!)
      if (!orden) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Orden de trabajo no encontrada'))
      }
      return response.ok(ApiResponse.success(serializeOrdenTrabajo(orden)))
    } catch (error) {
      if (error instanceof Error && error.message === 'TRANSICION_INVALIDA') {
        return response.badRequest(
          ApiResponse.error('TRANSICION_INVALIDA', 'Transición de estado no permitida')
        )
      }
      throw error
    }
  }
}
