import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import CajaMovimiento from '#models/caja_movimiento'

export default class Caja extends BaseModel {
  static table = 'cajas'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare nombre: string

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => CajaMovimiento)
  declare movimientos: HasMany<typeof CajaMovimiento>
}
