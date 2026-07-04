import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Vehiculo from '#models/vehiculo'
import Cilindro from '#models/cilindro'

export default class EquipoGnc extends BaseModel {
  static table = 'equipos_gnc'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare vehiculoId: string

  @column()
  declare numeroSerieEquipo: string

  @column()
  declare marcaRegulador: string

  @column()
  declare modeloRegulador: string

  @column.date()
  declare fechaInstalacion: DateTime

  @column.date()
  declare fechaVencimientoOblea: DateTime

  @column()
  declare estado: 'activo' | 'vencido' | 'desinstalado' | 'en_revision'

  @column()
  declare certificadorCrpc: string | null

  @column()
  declare notas: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Vehiculo)
  declare vehiculo: BelongsTo<typeof Vehiculo>

  @hasMany(() => Cilindro)
  declare cilindros: HasMany<typeof Cilindro>
}
