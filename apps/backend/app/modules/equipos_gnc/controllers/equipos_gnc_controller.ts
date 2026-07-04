import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import EquipoGncService from '#modules/equipos_gnc/services/equipo_gnc_service'
import { createEquipoGncValidator } from '#modules/equipos_gnc/validators/create_equipo_gnc_validator'

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

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createEquipoGncValidator)

    try {
      const equipo = await equipoGncService.create(dto, auth.user!)
      return response.created(ApiResponse.created(equipo))
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'MAX_CILINDROS_EXCEDIDO') {
          return response.badRequest(
            ApiResponse.error('MAX_CILINDROS_EXCEDIDO', 'Un equipo GNC no puede tener más de 4 cilindros')
          )
        }
        if (error.message === 'VEHICULO_NO_ENCONTRADO') {
          return response.notFound(ApiResponse.error('NOT_FOUND', 'Vehículo no encontrado'))
        }
      }
      throw error
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createEquipoGncValidator)
    const fechaInstalacion = DateTime.fromISO(dto.fechaInstalacion)

    const equipo = await equipoGncService.update(
      params.id,
      {
        vehiculoId: dto.vehiculoId,
        numeroSerieEquipo: dto.numeroSerieEquipo,
        marcaRegulador: dto.marcaRegulador,
        modeloRegulador: dto.modeloRegulador,
        fechaInstalacion,
        fechaVencimientoOblea: EquipoGncService.calcularVencimientoOblea(fechaInstalacion),
        certificadorCrpc: dto.certificadorCrpc ?? null,
        notas: dto.notas ?? null,
      },
      auth.user!
    )
    if (!equipo) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Equipo GNC no encontrado'))
    }
    return response.ok(ApiResponse.success(equipo))
  }

  async destroy({ params, auth, response }: HttpContext) {
    const deleted = await equipoGncService.delete(params.id, auth.user!)
    if (!deleted) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Equipo GNC no encontrado'))
    }
    return response.ok(ApiResponse.success({ message: 'Equipo GNC eliminado' }))
  }
}
