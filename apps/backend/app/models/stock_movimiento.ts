import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Producto from '#models/producto'
import User from '#models/user'

export default class StockMovimiento extends BaseModel {
  static table = 'stock_movimientos'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare productoId: string

  @column()
  declare tipo: 'ingreso' | 'egreso' | 'ajuste'

  @column()
  declare cantidad: number

  @column()
  declare motivo: string | null

  @column()
  declare userId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Producto)
  declare producto: BelongsTo<typeof Producto>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
