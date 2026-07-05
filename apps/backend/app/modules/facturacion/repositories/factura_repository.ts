import { DateTime } from 'luxon'
import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Factura from '#models/factura'
import { BaseRepository } from '#shared/base_repository'

export default class FacturaRepository extends BaseRepository<Factura> {
  protected model = Factura

  protected applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow> {
    return query.whereILike('numero', `%${search}%`)
  }

  async findByIdWithRelations(id: string): Promise<Factura | null> {
    return Factura.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('cliente')
      .preload('items')
      .first()
  }

  async findAllWithRelations(params = {}) {
    const result = await this.findAll(params)
    await Promise.all(
      result.data.map(async (factura) => {
        await factura.load('cliente')
        await factura.load('items')
      })
    )
    return result
  }

  async generateNumero(): Promise<string> {
    const year = DateTime.now().year
    const prefix = `FC-${year}-`

    const last = await Factura.query()
      .where('numero', 'like', `${prefix}%`)
      .orderBy('numero', 'desc')
      .first()

    let next = 1
    if (last) {
      next = Number.parseInt(last.numero.split('-')[2] ?? '0', 10) + 1
    }

    return `${prefix}${String(next).padStart(5, '0')}`
  }
}
