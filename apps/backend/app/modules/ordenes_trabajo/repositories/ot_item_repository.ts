import OtItem from '#models/ot_item'
import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { BaseRepository } from '#shared/base_repository'

export default class OtItemRepository extends BaseRepository<OtItem> {
  protected model = OtItem

  protected applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow> {
    return query.whereILike('descripcion', `%${search}%`)
  }

  async findByOrdenTrabajoId(ordenTrabajoId: string): Promise<OtItem[]> {
    return OtItem.query()
      .where('orden_trabajo_id', ordenTrabajoId)
      .whereNull('deleted_at')
      .preload('producto')
      .orderBy('created_at', 'asc')
  }

  async findByIdForOrden(ordenTrabajoId: string, itemId: string): Promise<OtItem | null> {
    return OtItem.query()
      .where('id', itemId)
      .where('orden_trabajo_id', ordenTrabajoId)
      .whereNull('deleted_at')
      .preload('producto')
      .first()
  }
}
