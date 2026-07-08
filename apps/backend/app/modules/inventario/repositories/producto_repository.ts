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

  async findAllWithCategoria(params: { stockBajo?: boolean } & Record<string, unknown> = {}) {
    const page = Number(params.page ?? 1)
    const perPage = Math.min(Number(params.perPage ?? 20), 100)

    let query = Producto.query().whereNull('deleted_at')

    if (params.stockBajo) {
      query = query.where('is_active', true).whereRaw('stock_actual <= stock_minimo')
    }

    if (params.search) {
      query = this.applySearch(query, String(params.search))
    }

    if (params.sortBy) {
      query = query.orderBy(String(params.sortBy), (params.sortOrder as 'asc' | 'desc') ?? 'asc')
    } else {
      query = query.orderBy('created_at', 'desc')
    }

    const result = await query.paginate(page, perPage)
    const data = result.all() as Producto[]
    await Promise.all(data.map((producto) => producto.load('categoria')))

    return {
      data,
      meta: {
        page: result.currentPage,
        perPage: result.perPage,
        total: result.total,
        lastPage: result.lastPage,
      },
    }
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
