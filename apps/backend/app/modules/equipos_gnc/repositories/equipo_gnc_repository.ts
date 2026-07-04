import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import EquipoGnc from '#models/equipo_gnc'
import { BaseRepository } from '#shared/base_repository'

export default class EquipoGncRepository extends BaseRepository<EquipoGnc> {
  protected model = EquipoGnc

  protected applySearch(
    query: ModelQueryBuilderContract<EquipoGnc>,
    search: string
  ): ModelQueryBuilderContract<EquipoGnc> {
    return query.where((builder) => {
      builder
        .whereILike('numero_serie_equipo', `%${search}%`)
        .orWhereILike('marca_regulador', `%${search}%`)
        .orWhereILike('modelo_regulador', `%${search}%`)
    })
  }

  async findByIdWithCilindros(id: string): Promise<EquipoGnc | null> {
    return EquipoGnc.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('cilindros', (query) => query.whereNull('deleted_at').orderBy('posicion', 'asc'))
      .preload('vehiculo', (query) => query.preload('cliente'))
      .first()
  }

  async findAllWithCilindros(params = {}) {
    const result = await this.findAll(params)
    await Promise.all(
      result.data.map((equipo) =>
        equipo.load('cilindros', (query) =>
          query.whereNull('deleted_at').orderBy('posicion', 'asc')
        )
      )
    )
    return result
  }
}
