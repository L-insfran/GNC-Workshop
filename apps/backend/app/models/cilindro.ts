import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import EquipoGnc from '#models/equipo_gnc'

export default class Cilindro extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare equipoGncId: string

  @column()
  declare numeroSerie: string

  @column()
  declare capacidadM3: number

  @column()
  declare marca: string

  @column.date()
  declare fechaFabricacion: DateTime | null

  @column.date()
  declare fechaUltimaPh: DateTime

  @column.date()
  declare fechaVencimientoPh: DateTime

  @column()
  declare estado: 'activo' | 'vencido' | 'retirado' | 'en_ph'

  @column()
  declare posicion: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => EquipoGnc)
  declare equipoGnc: BelongsTo<typeof EquipoGnc>
}
