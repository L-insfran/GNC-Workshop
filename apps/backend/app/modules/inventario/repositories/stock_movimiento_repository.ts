import type { IListMovimientosParams } from '@gnc/shared-types'
import type { IPaginationMeta } from '@gnc/shared-types'
import StockMovimiento from '#models/stock_movimiento'

export default class StockMovimientoRepository {
  async findAll(params: IListMovimientosParams = {}) {
    const page = params.page ?? 1
    const perPage = Math.min(params.perPage ?? 20, 100)

    let query = StockMovimiento.query().preload('producto').preload('user').orderBy('created_at', 'desc')

    if (params.productoId) {
      query = query.where('producto_id', params.productoId)
    }

    if (params.ordenTrabajoId) {
      query = query.where('orden_trabajo_id', params.ordenTrabajoId)
    }

    const result = await query.paginate(page, perPage)

    const meta: IPaginationMeta = {
      page: result.currentPage,
      perPage: result.perPage,
      total: result.total,
      lastPage: result.lastPage,
    }

    return { data: result.all(), meta }
  }
}
