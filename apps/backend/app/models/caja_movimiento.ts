import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Caja from '#models/caja'
import User from '#models/user'

export default class CajaMovimiento extends BaseModel {
  static table = 'caja_movimientos'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare cajaId: string

  @column()
  declare tipo: 'ingreso' | 'egreso'

  @column()
  declare monto: number

  @column()
  declare concepto: string

  @column()
  declare facturaId: string | null

  @column()
  declare userId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Caja)
  declare caja: BelongsTo<typeof Caja>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
