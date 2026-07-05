import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Cliente from '#models/cliente'
import Vehiculo from '#models/vehiculo'

export default class Turno extends BaseModel {
  static table = 'turnos'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare clienteId: string

  @column()
  declare vehiculoId: string | null

  @column.dateTime()
  declare fechaHora: DateTime

  @column()
  declare estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado'

  @column()
  declare notas: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>

  @belongsTo(() => Vehiculo)
  declare vehiculo: BelongsTo<typeof Vehiculo>
}
