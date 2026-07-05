import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Vehiculo from '#models/vehiculo'
import { BaseRepository } from '#shared/base_repository'

export default class VehiculoRepository extends BaseRepository<Vehiculo> {
  protected model = Vehiculo

  protected applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow> {
    return query.whereILike('patente', `%${search}%`)
  }

  async findByIdWithRelations(id: string): Promise<Vehiculo | null> {
    return Vehiculo.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('marca')
      .preload('modelo')
      .preload('cliente')
      .first()
  }

  async findAllWithRelations(params = {}) {
    const result = await this.findAll(params)
    await Promise.all(
      result.data.map(async (vehiculo) => {
        await vehiculo.load('marca')
        await vehiculo.load('modelo')
      })
    )
    return result
  }

  async findByPatente(patente: string): Promise<Vehiculo | null> {
    return Vehiculo.query()
      .where('patente', patente.toUpperCase())
      .whereNull('deleted_at')
      .where('is_active', true)
      .first()
  }
}
