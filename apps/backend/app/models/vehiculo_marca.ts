import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import VehiculoModelo from '#models/vehiculo_modelo'

export default class VehiculoMarca extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare nombre: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => VehiculoModelo)
  declare modelos: HasMany<typeof VehiculoModelo>
}
