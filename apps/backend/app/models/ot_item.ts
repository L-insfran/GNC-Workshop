import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import OrdenTrabajo from '#models/orden_trabajo'
import Producto from '#models/producto'
import User from '#models/user'

export default class OtItem extends BaseModel {
  static table = 'ot_items'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare ordenTrabajoId: string

  @column()
  declare tipo: 'servicio' | 'repuesto' | 'material'

  @column()
  declare productoId: string | null

  @column()
  declare descripcion: string

  @column()
  declare cantidad: number

  @column()
  declare precioUnitario: number

  @column()
  declare subtotal: number

  @column()
  declare esEstimado: boolean

  @column()
  declare createdBy: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => OrdenTrabajo)
  declare ordenTrabajo: BelongsTo<typeof OrdenTrabajo>

  @belongsTo(() => Producto)
  declare producto: BelongsTo<typeof Producto>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creador: BelongsTo<typeof User>
}
