import { DateTime } from 'luxon'
import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Turno from '#models/turno'
import { BaseRepository } from '#shared/base_repository'

export default class TurnoRepository extends BaseRepository<Turno> {
  protected model = Turno

  protected applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow> {
    return query.whereILike('notas', `%${search}%`)
  }

  async findByIdWithRelations(id: string): Promise<Turno | null> {
    return Turno.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('cliente')
      .preload('vehiculo')
      .first()
  }

  async findAllWithRelations(params = {}) {
    const result = await this.findAll(params)
    await Promise.all(
      result.data.map(async (turno) => {
        await turno.load('cliente')
        await turno.load('vehiculo')
      })
    )
    return result
  }

  async findByFecha(fecha: DateTime): Promise<Turno[]> {
    const inicio = fecha.startOf('day').toSQL()
    const fin = fecha.endOf('day').toSQL()

    return Turno.query()
      .whereNull('deleted_at')
      .whereBetween('fecha_hora', [inicio!, fin!])
      .preload('cliente')
      .preload('vehiculo')
      .orderBy('fecha_hora', 'asc')
  }

  async findSolapamiento(fechaHora: DateTime, excludeId?: string): Promise<Turno | null> {
    const inicio = fechaHora.minus({ minutes: 29 }).toSQL()
    const fin = fechaHora.plus({ minutes: 29 }).toSQL()

    let query = Turno.query()
      .whereNull('deleted_at')
      .whereNotIn('estado', ['cancelado', 'completado'])
      .whereBetween('fecha_hora', [inicio!, fin!])

    if (excludeId) {
      query = query.whereNot('id', excludeId)
    }

    return query.first()
  }
}
