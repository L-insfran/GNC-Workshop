import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Cliente from '#models/cliente'
import OrdenTrabajo from '#models/orden_trabajo'
import FacturaItem from '#models/factura_item'

export default class Factura extends BaseModel {
  static table = 'facturas'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare numero: string

  @column()
  declare clienteId: string

  @column()
  declare ordenTrabajoId: string | null

  @column()
  declare tipo: 'factura_a' | 'factura_b' | 'factura_c' | 'nota_credito'

  @column()
  declare subtotal: number

  @column()
  declare iva: number

  @column()
  declare total: number

  @column()
  declare estado: 'borrador' | 'emitida' | 'anulada'

  @column.dateTime()
  declare fechaEmision: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>

  @belongsTo(() => OrdenTrabajo)
  declare ordenTrabajo: BelongsTo<typeof OrdenTrabajo>

  @hasMany(() => FacturaItem)
  declare items: HasMany<typeof FacturaItem>
}
