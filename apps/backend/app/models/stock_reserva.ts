import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Producto from '#models/producto'
import OrdenTrabajo from '#models/orden_trabajo'
import OtItem from '#models/ot_item'
import User from '#models/user'

export default class StockReserva extends BaseModel {
  static table = 'stock_reservas'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare productoId: string

  @column()
  declare ordenTrabajoId: string

  @column()
  declare otItemId: string

  @column()
  declare cantidad: number

  @column()
  declare userId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare releasedAt: DateTime | null

  @column()
  declare motivoLiberacion: string | null

  @belongsTo(() => Producto)
  declare producto: BelongsTo<typeof Producto>

  @belongsTo(() => OrdenTrabajo)
  declare ordenTrabajo: BelongsTo<typeof OrdenTrabajo>

  @belongsTo(() => OtItem)
  declare otItem: BelongsTo<typeof OtItem>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
