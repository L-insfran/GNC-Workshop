import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import {
  getOrdenEstadosSiguientes,
  type CreateOrdenTrabajoDTO,
  type OrdenEstado,
  type UpdateOrdenEstadoDTO,
} from '@gnc/shared-types'
import type { IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import type OrdenTrabajo from '#models/orden_trabajo'
import EquipoGnc from '#models/equipo_gnc'
import TipoTrabajo from '#models/tipo_trabajo'
import Vehiculo from '#models/vehiculo'
import { BaseService } from '#shared/base_service'
import { parseDateOnly } from '#shared/date_util'
import OrdenTrabajoRepository from '#modules/ordenes_trabajo/repositories/orden_trabajo_repository'

function resolveFechaEstimadaEntrega(
  value: string | undefined,
  fechaIngreso: DateTime,
  tipoTrabajo: TipoTrabajo
): DateTime | null {
  if (value) {
    const fechaEstimada = parseDateOnly(value, 'fechaEstimadaEntrega')
    const ingresoDia = fechaIngreso.setZone('utc').startOf('day')

    if (fechaEstimada < ingresoDia) {
      throw new Error('FECHA_ENTREGA_INVALIDA')
    }

    return fechaEstimada
  }

  const diasEstimados = Math.max(1, Math.ceil((tipoTrabajo.duracionEstimadaHoras ?? 8) / 8))
  return fechaIngreso.setZone('utc').startOf('day').plus({ days: diasEstimados - 1 })
}

export default class OrdenTrabajoService extends BaseService<OrdenTrabajo> {
  protected entityType = 'orden_trabajo'
  protected repository = new OrdenTrabajoRepository()

  async list(params?: IPaginationParams) {
    return this.repository.findAllWithRelations(params)
  }

  async getById(id: string): Promise<OrdenTrabajo | null> {
    return this.repository.findByIdWithRelations(id)
  }

  async create(data: CreateOrdenTrabajoDTO, user: User): Promise<OrdenTrabajo> {
    const vehiculo = await Vehiculo.query()
      .where('id', data.vehiculoId)
      .where('cliente_id', data.clienteId)
      .whereNull('deleted_at')
      .first()

    if (!vehiculo) {
      throw new Error('VEHICULO_INVALIDO')
    }

    const tipoTrabajo = await TipoTrabajo.find(data.tipoTrabajoId)
    if (!tipoTrabajo || !tipoTrabajo.isActive) {
      throw new Error('TIPO_TRABAJO_INVALIDO')
    }

    if (data.equipoGncId) {
      const equipo = await EquipoGnc.query()
        .where('id', data.equipoGncId)
        .where('vehiculo_id', data.vehiculoId)
        .whereNull('deleted_at')
        .first()

      if (!equipo) {
        throw new Error('EQUIPO_INVALIDO')
      }

      const esRenovacionOblea = tipoTrabajo.nombre.toLowerCase().includes('renovación de oblea')
      const obleaVencida = equipo.fechaVencimientoOblea < DateTime.now()

      if (obleaVencida && !esRenovacionOblea) {
        throw new Error('OBLEA_VENCIDA')
      }
    }

    const numero = await this.repository.generateNumero()
    const fechaIngreso = DateTime.now()

    const orden = await super.create(
      {
        numero,
        clienteId: data.clienteId,
        vehiculoId: data.vehiculoId,
        equipoGncId: data.equipoGncId ?? null,
        tipoTrabajoId: data.tipoTrabajoId,
        estado: 'borrador',
        prioridad: data.prioridad ?? 'normal',
        fechaIngreso,
        fechaEstimadaEntrega: resolveFechaEstimadaEntrega(
          data.fechaEstimadaEntrega,
          fechaIngreso,
          tipoTrabajo
        ),
        mecanicoAsignadoId: data.mecanicoAsignadoId ?? null,
        recepcionistaId: user.id,
        kilometrajeIngreso: data.kilometrajeIngreso ?? null,
        descripcionProblema: data.descripcionProblema ?? null,
        observacionesInternas: data.observacionesInternas ?? null,
      },
      user
    )

    return (await this.repository.findByIdWithRelations(orden.id))!
  }

  async update(id: string, data: Partial<OrdenTrabajo>, user: User): Promise<OrdenTrabajo | null> {
    const existing = await this.repository.findById(id)
    if (!existing) return null

    if (data.fechaEstimadaEntrega) {
      const fechaEstimada = data.fechaEstimadaEntrega.setZone('utc').startOf('day')
      const ingresoDia = existing.fechaIngreso.setZone('utc').startOf('day')

      if (fechaEstimada < ingresoDia) {
        throw new Error('FECHA_ENTREGA_INVALIDA')
      }
    }

    const updated = await super.update(id, data, user)
    if (!updated) return null
    return this.repository.findByIdWithRelations(id)
  }

  async updateEstado(
    id: string,
    dto: UpdateOrdenEstadoDTO,
    user: User
  ): Promise<OrdenTrabajo | null> {
    const orden = await this.repository.findById(id)
    if (!orden) return null

    const estadoActual = orden.estado
    const estadoNuevo = dto.estado

    if (estadoActual === estadoNuevo) {
      return this.repository.findByIdWithRelations(id)
    }

    const transiciones = getOrdenEstadosSiguientes(estadoActual)
    if (!transiciones.includes(estadoNuevo)) {
      throw new Error('TRANSICION_INVALIDA')
    }

    if (estadoNuevo === 'entregada' && estadoActual !== 'finalizada') {
      throw new Error('TRANSICION_INVALIDA')
    }

    const updateData: Partial<OrdenTrabajo> = { estado: estadoNuevo }
    if (estadoNuevo === 'entregada') {
      updateData.fechaEntregaReal = DateTime.now()
    }

    const trx = await db.transaction()

    try {
      orden.useTransaction(trx)
      orden.merge(updateData)
      await orden.save()

      await trx
        .table('ot_estados_historial')
        .insert({
          orden_trabajo_id: orden.id,
          estado_anterior: estadoActual,
          estado_nuevo: estadoNuevo,
          user_id: user.id,
          observacion: dto.observacion ?? null,
          created_at: DateTime.now().toSQL(),
        })

      await trx.commit()

      const { EntityUpdated } = await import('#events/audit_events')
      await EntityUpdated.dispatch({
        userId: user.id,
        entityType: this.entityType,
        entityId: orden.id,
        oldValues: { estado: estadoActual },
        newValues: { estado: estadoNuevo },
      })

      return this.repository.findByIdWithRelations(id)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
