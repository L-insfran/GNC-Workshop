import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import TipoTrabajo from '#models/tipo_trabajo'
import Producto from '#models/producto'

export default class KitTrabajoItem extends BaseModel {
  static table = 'kit_trabajo_items'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare tipoTrabajoId: string

  @column()
  declare tipo: 'servicio' | 'repuesto' | 'material'

  @column()
  declare productoId: string | null

  @column()
  declare descripcion: string

  @column()
  declare cantidad: number

  @column()
  declare precioUnitario: number | null

  @column()
  declare esEstimado: boolean

  @column()
  declare orden: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => TipoTrabajo)
  declare tipoTrabajo: BelongsTo<typeof TipoTrabajo>

  @belongsTo(() => Producto)
  declare producto: BelongsTo<typeof Producto>
}
