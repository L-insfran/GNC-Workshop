import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'
import TipoTrabajoService from '#modules/ordenes_trabajo/services/tipo_trabajo_service'
import {
  createTipoTrabajoValidator,
  updateTipoTrabajoValidator,
} from '#modules/ordenes_trabajo/validators/tipo_trabajo_validator'

const tipoTrabajoService = new TipoTrabajoService()

function serializeTipo(tipo: {
  id: string
  nombre: string
  descripcion: string | null
  duracionEstimadaHoras: number | null
  isActive: boolean
  createdAt: { toISO: () => string | null }
}) {
  return {
    id: tipo.id,
    nombre: tipo.nombre,
    descripcion: tipo.descripcion ?? undefined,
    duracionEstimadaHoras: tipo.duracionEstimadaHoras ?? undefined,
    isActive: tipo.isActive,
    createdAt: tipo.createdAt.toISO()!,
  }
}

export default class TiposTrabajoController {
  async index({ request, response }: HttpContext) {
    const includeInactive = request.input('includeInactive') === 'true'
    const tipos = await tipoTrabajoService.list(includeInactive)
    return response.ok(ApiResponse.success(tipos.map(serializeTipo)))
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createTipoTrabajoValidator)
    try {
      const tipo = await tipoTrabajoService.create(dto, auth.user!)
      return response.created(ApiResponse.created(serializeTipo(tipo)))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateTipoTrabajoValidator)
    try {
      const tipo = await tipoTrabajoService.update(params.id, dto, auth.user!)
      if (!tipo) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Tipo de trabajo no encontrado'))
      }
      return response.ok(ApiResponse.success(serializeTipo(tipo)))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    try {
      const deleted = await tipoTrabajoService.deactivate(params.id, auth.user!)
      if (!deleted) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Tipo de trabajo no encontrado'))
      }
      return response.ok(ApiResponse.success({ message: 'Tipo de trabajo desactivado' }))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  private handleError(error: unknown, response: HttpContext['response']) {
    if (error instanceof Error) {
      if (error.message === 'NOMBRE_DUPLICADO') {
        return response.conflict(
          ApiResponse.error('NOMBRE_DUPLICADO', 'Ya existe un tipo de trabajo con ese nombre')
        )
      }
      if (error.message === 'EN_USO') {
        return response.conflict(
          ApiResponse.error(
            'EN_USO',
            'No se puede desactivar: hay órdenes de trabajo activas con este tipo'
          )
        )
      }
    }
    throw error
  }
}
