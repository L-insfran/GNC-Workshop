import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Factura from '#models/factura'

export default class FacturaItem extends BaseModel {
  static table = 'factura_items'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare facturaId: string

  @column()
  declare descripcion: string

  @column()
  declare cantidad: number

  @column()
  declare precioUnitario: number

  @column()
  declare subtotal: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Factura)
  declare factura: BelongsTo<typeof Factura>
}
