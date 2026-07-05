import { DateTime } from 'luxon'
import type { CreateTurnoDTO, IPaginationParams, UpdateTurnoDTO } from '@gnc/shared-types'
import type User from '#models/user'
import type Turno from '#models/turno'
import Cliente from '#models/cliente'
import { BaseService } from '#shared/base_service'
import TurnoRepository from '#modules/agenda/repositories/turno_repository'

export default class TurnoService extends BaseService<Turno> {
  protected entityType = 'turno'
  protected repository = new TurnoRepository()

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

    const turno = await super.create(
      {
        clienteId: data.clienteId,
        vehiculoId: data.vehiculoId ?? null,
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
}
