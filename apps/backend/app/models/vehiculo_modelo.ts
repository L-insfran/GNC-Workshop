import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import VehiculoMarca from '#models/vehiculo_marca'

export default class VehiculoModelo extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare marcaId: string

  @column()
  declare nombre: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => VehiculoMarca, { foreignKey: 'marcaId' })
  declare marca: BelongsTo<typeof VehiculoMarca>
}
