import OtItem from '#models/ot_item'
import db from '@adonisjs/lucid/services/db'
import type { IOrdenMargenResumen } from '@gnc/shared-types'
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

  async findMargenResumenByOrdenTrabajoIds(
    ordenTrabajoIds: string[]
  ): Promise<Map<string, IOrdenMargenResumen>> {
    const resumen = new Map<string, IOrdenMargenResumen>()
    if (ordenTrabajoIds.length === 0) return resumen

    const rows = await db
      .from('ot_items')
      .leftJoin('productos', 'ot_items.producto_id', 'productos.id')
      .whereIn('ot_items.orden_trabajo_id', ordenTrabajoIds)
      .whereNull('ot_items.deleted_at')
      .groupBy('ot_items.orden_trabajo_id')
      .select('ot_items.orden_trabajo_id')
      .select(
        db.raw('COALESCE(SUM(ot_items.subtotal), 0) as ingreso_total'),
        db.raw(
          `COALESCE(SUM(
            CASE WHEN ot_items.producto_id IS NOT NULL
              THEN ot_items.cantidad * productos.precio_compra
              ELSE 0
            END
          ), 0) as costo_repuestos`
        )
      )

    for (const row of rows) {
      const ingresoTotal = Number(Number(row.ingreso_total).toFixed(2))
      const costoRepuestos = Number(Number(row.costo_repuestos).toFixed(2))
      const margenBruto = Number((ingresoTotal - costoRepuestos).toFixed(2))
      const margenPorcentaje =
        ingresoTotal > 0 ? Number(((margenBruto / ingresoTotal) * 100).toFixed(1)) : null

      resumen.set(row.orden_trabajo_id, {
        ingresoTotal,
        costoRepuestos,
        margenBruto,
        margenPorcentaje,
      })
    }

    return resumen
  }
}
