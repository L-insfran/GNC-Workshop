import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import CategoriaProducto from '#models/categoria_producto'
import StockMovimiento from '#models/stock_movimiento'

export default class Producto extends BaseModel {
  static table = 'productos'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare codigo: string

  @column()
  declare nombre: string

  @column()
  declare categoriaId: string | null

  @column()
  declare precioCompra: number

  @column()
  declare precioVenta: number

  @column()
  declare stockMinimo: number

  @column()
  declare stockActual: number

  @column()
  declare unidadMedida: string

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => CategoriaProducto, { foreignKey: 'categoriaId' })
  declare categoria: BelongsTo<typeof CategoriaProducto>

  @hasMany(() => StockMovimiento)
  declare movimientos: HasMany<typeof StockMovimiento>
}
