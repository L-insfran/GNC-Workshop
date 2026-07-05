import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Producto from '#models/producto'

export default class CategoriaProducto extends BaseModel {
  static table = 'categorias_producto'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare nombre: string

  @column()
  declare descripcion: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => Producto)
  declare productos: HasMany<typeof Producto>
}
