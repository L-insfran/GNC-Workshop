import { DateTime } from 'luxon'
import type { CreateTurnoDTO, IPaginationParams, UpdateTurnoDTO } from '@gnc/shared-types'
import type User from '#models/user'
import type Turno from '#models/turno'
import Cliente from '#models/cliente'
import TipoTrabajo from '#models/tipo_trabajo'
import { BaseService } from '#shared/base_service'
import TurnoRepository from '#modules/agenda/repositories/turno_repository'
import OrdenTrabajoService from '#modules/ordenes_trabajo/services/orden_trabajo_service'
import type OrdenTrabajo from '#models/orden_trabajo'

export default class TurnoService extends BaseService<Turno> {
  protected entityType = 'turno'
  protected repository = new TurnoRepository()
  private ordenTrabajoService = new OrdenTrabajoService()

  async list(params?: IPaginationParams) {
    return this.repository.findAllWithRelations(params)
  }

  async getById(id: string): Promise<Turno | null> {
    return this.repository.findByIdWithRelations(id)
  }

  async listByFecha(fecha: string): Promise<Turno[]> {
    const day = DateTime.fromISO(fecha, { zone: 'utc' })
    if (!day.isValid) {
      throw new Error('FECHA_INVALIDA')
    }
    return this.repository.findByFecha(day)
  }

  async create(data: CreateTurnoDTO, user: User): Promise<Turno> {
    const cliente = await Cliente.query()
      .where('id', data.clienteId)
      .whereNull('deleted_at')
      .first()

    if (!cliente) {
      throw new Error('CLIENTE_NO_ENCONTRADO')
    }

    const fechaHora = DateTime.fromISO(data.fechaHora, { setZone: true })
    if (!fechaHora.isValid) {
      throw new Error('FECHA_INVALIDA')
    }

    const solapado = await this.repository.findSolapamiento(fechaHora)
    if (solapado) {
      throw new Error('TURNO_SOLAPADO')
    }

    const tipoTrabajoId = await this.resolveTipoTrabajoId(data.tipoTrabajoId)

    const turno = await super.create(
      {
        clienteId: data.clienteId,
        vehiculoId: data.vehiculoId ?? null,
        tipoTrabajoId,
        fechaHora,
        estado: data.estado ?? 'pendiente',
        notas: data.notas ?? null,
      },
      user
    )

    return (await this.repository.findByIdWithRelations(turno.id))!
  }

  async update(id: string, data: UpdateTurnoDTO, user: User): Promise<Turno | null> {
    const existing = await this.repository.findById(id)
    if (!existing) return null

    const updateData: Partial<Turno> = {}

    if (data.clienteId) updateData.clienteId = data.clienteId
    if (data.vehiculoId !== undefined) updateData.vehiculoId = data.vehiculoId ?? null
    if (data.estado) updateData.estado = data.estado
    if (data.notas !== undefined) updateData.notas = data.notas ?? null
    if (data.tipoTrabajoId !== undefined) {
      updateData.tipoTrabajoId = await this.resolveTipoTrabajoId(data.tipoTrabajoId)
    }

    if (data.fechaHora) {
      const fechaHora = DateTime.fromISO(data.fechaHora, { setZone: true })
      if (!fechaHora.isValid) {
        throw new Error('FECHA_INVALIDA')
      }

      const solapado = await this.repository.findSolapamiento(fechaHora, id)
      if (solapado) {
        throw new Error('TURNO_SOLAPADO')
      }

      updateData.fechaHora = fechaHora
    }

    const updated = await super.update(id, updateData, user)
    if (!updated) return null

    return this.repository.findByIdWithRelations(updated.id)
  }

  async generarOrdenDesdeTurno(turnoId: string, user: User): Promise<OrdenTrabajo> {
    const turno = await this.repository.findByIdWithRelations(turnoId)
    if (!turno) {
      throw new Error('TURNO_NO_ENCONTRADO')
    }

    if (turno.estado === 'cancelado') {
      throw new Error('TURNO_CANCELADO')
    }

    if (turno.ordenTrabajoId) {
      throw new Error('TURNO_YA_ATENDIDO')
    }

    if (!turno.vehiculoId) {
      throw new Error('VEHICULO_REQUERIDO')
    }

    if (!turno.tipoTrabajoId) {
      throw new Error('TIPO_TRABAJO_REQUERIDO')
    }

    const orden = await this.ordenTrabajoService.create(
      {
        clienteId: turno.clienteId,
        vehiculoId: turno.vehiculoId,
        tipoTrabajoId: turno.tipoTrabajoId,
        descripcionProblema: turno.notas ?? undefined,
      },
      user
    )

    turno.merge({
      estado: 'completado',
      ordenTrabajoId: orden.id,
    })
    await turno.save()

    return orden
  }

  private async resolveTipoTrabajoId(tipoTrabajoId?: string | null): Promise<string | null> {
    if (!tipoTrabajoId) return null

    const tipo = await TipoTrabajo.find(tipoTrabajoId)
    if (!tipo || !tipo.isActive) {
      throw new Error('TIPO_TRABAJO_INVALIDO')
    }

    return tipo.id
  }
}
