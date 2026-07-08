import type { HttpContext } from '@adonisjs/core/http'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import { parseDateOnly } from '#shared/date_util'
import { serializeOrdenTrabajo, serializeOrdenesTrabajo } from '#shared/orden_trabajo_serializer'
import { buildOtSenaResumen } from '#shared/ot_sena_util'
import OrdenTrabajoService from '#modules/ordenes_trabajo/services/orden_trabajo_service'
import FacturaService from '#modules/facturacion/services/factura_service'
import FacturaRepository from '#modules/facturacion/repositories/factura_repository'
import { createOrdenTrabajoValidator } from '#modules/ordenes_trabajo/validators/create_orden_trabajo_validator'
import { updateEstadoValidator } from '#modules/ordenes_trabajo/validators/update_estado_validator'

const ordenTrabajoService = new OrdenTrabajoService()
const facturaService = new FacturaService()
const facturaRepository = new FacturaRepository()

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
      ApiResponse.paginated(
        serializeOrdenesTrabajo(result.data, result.resumenesCobro, result.resumenesMargen),
        result.meta as never
      )
    )
  }

  async show({ params, response }: HttpContext) {
    const orden = await ordenTrabajoService.getById(params.id)
    if (!orden) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Orden de trabajo no encontrada'))
    }

    const [resumenesCobro, resumenSena] = await Promise.all([
      facturaRepository.findCobroResumenByOrdenTrabajoIds(
        [params.id],
        new Map([[params.id, orden.estado]])
      ),
      buildOtSenaResumen(params.id),
    ])

    return response.ok(
      ApiResponse.success(
        serializeOrdenTrabajo(orden, resumenesCobro.get(params.id), undefined, resumenSena)
      )
    )
  }

  async facturaBorrador({ params, response }: HttpContext) {
    try {
      const borrador = await ordenTrabajoService.getFacturaBorrador(params.id)
      if (!borrador) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Orden de trabajo no encontrada'))
      }
      return response.ok(ApiResponse.success(borrador))
    } catch (error) {
      if (error instanceof Error) {
        const messages: Record<string, [string, string]> = {
          OT_ESTADO_INVALIDO_FACTURA: [
            'OT_ESTADO_INVALIDO_FACTURA',
            'Solo se puede facturar una OT en estado finalizada o entregada',
          ],
          OT_SIN_ITEMS: [
            'OT_SIN_ITEMS',
            'La orden de trabajo no tiene ítems en el presupuesto para facturar',
          ],
          OT_YA_FACTURADA: [
            'OT_YA_FACTURADA',
            'Esta orden de trabajo ya tiene una factura activa vinculada',
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

  async facturaVinculada({ params, response }: HttpContext) {
    const orden = await ordenTrabajoService.getById(params.id)
    if (!orden) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Orden de trabajo no encontrada'))
    }

    const vinculada = await facturaService.getFacturaVinculadaOT(params.id)
    return response.ok(ApiResponse.success(vinculada))
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
          PH_VENCIDA: [
            'PH_VENCIDA',
            'No se puede crear la OT: hay cilindros con PH vencida. Solo permitido para prueba hidráulica o reparación de cilindro',
          ],
          FECHA_ENTREGA_INVALIDA: [
            'FECHA_ENTREGA_INVALIDA',
            'La fecha estimada de entrega no puede ser anterior a la fecha de ingreso',
          ],
          MONTO_COBRO_INVALIDO: [
            'MONTO_COBRO_INVALIDO',
            'El monto de la seña debe ser mayor a cero',
          ],
          MECANICO_INVALIDO: [
            'MECANICO_INVALIDO',
            'El mecánico seleccionado no es válido o no está activo',
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

    try {
      const orden = await ordenTrabajoService.update(
        params.id,
        {
          clienteId: dto.clienteId,
          vehiculoId: dto.vehiculoId,
          equipoGncId: dto.equipoGncId ?? null,
          tipoTrabajoId: dto.tipoTrabajoId,
          prioridad: dto.prioridad ?? 'normal',
          fechaEstimadaEntrega: dto.fechaEstimadaEntrega
            ? parseDateOnly(dto.fechaEstimadaEntrega, 'fechaEstimadaEntrega')
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
    } catch (error) {
      if (error instanceof Error && error.message === 'FECHA_ENTREGA_INVALIDA') {
        return response.badRequest(
          ApiResponse.error(
            'FECHA_ENTREGA_INVALIDA',
            'La fecha estimada de entrega no puede ser anterior a la fecha de ingreso'
          )
        )
      }
      if (error instanceof Error && error.message === 'MECANICO_INVALIDO') {
        return response.badRequest(
          ApiResponse.error(
            'MECANICO_INVALIDO',
            'El mecánico seleccionado no es válido o no está activo'
          )
        )
      }
      throw error
    }
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
      if (error instanceof Error) {
        const messages: Record<string, [string, string]> = {
          TRANSICION_INVALIDA: ['TRANSICION_INVALIDA', 'Transición de estado no permitida'],
          MECANICO_REQUERIDO: [
            'MECANICO_REQUERIDO',
            'Debe asignar un mecánico para pasar la OT a taller',
          ],
          MECANICO_INVALIDO: [
            'MECANICO_INVALIDO',
            'El mecánico seleccionado no es válido o no está activo',
          ],
          SIN_MECANICOS_REGISTRADOS: [
            'SIN_MECANICOS_REGISTRADOS',
            'No hay mecánicos registrados en el sistema. Registre al menos uno en Configuración > Usuarios',
          ],
          STOCK_INSUFICIENTE_RESERVA: [
            'STOCK_INSUFICIENTE_RESERVA',
            'No hay stock disponible para reservar los repuestos de esta OT. Verifique el inventario.',
          ],
          CONTROL_CALIDAD_INCOMPLETO: [
            'CONTROL_CALIDAD_INCOMPLETO',
            'Debe completar y aprobar el checklist de control de calidad antes de finalizar la OT',
          ],
        }
        const mapped = messages[error.message]
        if (mapped) {
          return response.badRequest(ApiResponse.error(mapped[0], mapped[1]))
        }

        if (error.message.startsWith('STOCK_INSUFICIENTE_OT:')) {
          const producto = error.message.split(':').slice(1).join(':')
          return response.badRequest(
            ApiResponse.error(
              'STOCK_INSUFICIENTE_OT',
              `Stock insuficiente para el producto "${producto}". Verifique el inventario antes de finalizar la OT.`
            )
          )
        }

        if (error.message.startsWith('PRODUCTO_NO_ENCONTRADO_OT:')) {
          const descripcion = error.message.split(':').slice(1).join(':')
          return response.badRequest(
            ApiResponse.error(
              'PRODUCTO_NO_ENCONTRADO_OT',
              `El producto vinculado al ítem "${descripcion}" ya no existe en inventario`
            )
          )
        }
      }
      throw error
    }
  }
}
