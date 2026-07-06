import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { CreateOrdenTrabajoDTO, OrdenEstado, UpdateOrdenEstadoDTO } from '@gnc/shared-types'
import type { IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import type OrdenTrabajo from '#models/orden_trabajo'
import EquipoGnc from '#models/equipo_gnc'
import TipoTrabajo from '#models/tipo_trabajo'
import Vehiculo from '#models/vehiculo'
import { BaseService } from '#shared/base_service'
import OrdenTrabajoRepository from '#modules/ordenes_trabajo/repositories/orden_trabajo_repository'

const TRANSICIONES_PERMITIDAS: Record<OrdenEstado, OrdenEstado[]> = {
  borrador: ['recepcion'],
  recepcion: ['en_taller', 'cancelada'],
  en_taller: ['en_espera_repuesto', 'control_calidad', 'cancelada'],
  en_espera_repuesto: ['en_taller'],
  control_calidad: ['finalizada', 'en_taller'],
  finalizada: ['entregada'],
  entregada: [],
  cancelada: [],
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

    const orden = await super.create(
      {
        numero,
        clienteId: data.clienteId,
        vehiculoId: data.vehiculoId,
        equipoGncId: data.equipoGncId ?? null,
        tipoTrabajoId: data.tipoTrabajoId,
        estado: 'borrador',
        prioridad: data.prioridad ?? 'normal',
        fechaIngreso: DateTime.now(),
        fechaEstimadaEntrega: data.fechaEstimadaEntrega
          ? DateTime.fromISO(data.fechaEstimadaEntrega)
          : null,
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

    const transiciones = TRANSICIONES_PERMITIDAS[estadoActual]
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
