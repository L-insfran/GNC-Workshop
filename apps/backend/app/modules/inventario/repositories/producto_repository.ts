import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Producto from '#models/producto'
import { BaseRepository } from '#shared/base_repository'

export default class ProductoRepository extends BaseRepository<Producto> {
  protected model = Producto

  protected applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow> {
    return query.where((builder) => {
      builder
        .whereILike('codigo', `%${search}%`)
        .orWhereILike('nombre', `%${search}%`)
    })
  }

  async findByIdWithCategoria(id: string): Promise<Producto | null> {
    return Producto.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('categoria')
      .first()
  }

  async findAllWithCategoria(params = {}) {
    const result = await this.findAll(params)
    await Promise.all(result.data.map((producto) => producto.load('categoria')))
    return result
  }

  async findByCodigo(codigo: string): Promise<Producto | null> {
    return Producto.query().where('codigo', codigo).whereNull('deleted_at').first()
  }

  async findStockBajo(): Promise<Producto[]> {
    return Producto.query()
      .whereNull('deleted_at')
      .where('is_active', true)
      .whereRaw('stock_actual <= stock_minimo')
      .preload('categoria')
      .orderBy('stock_actual', 'asc')
  }
}
