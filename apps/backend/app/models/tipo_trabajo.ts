import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TipoTrabajo extends BaseModel {
  static table = 'tipos_trabajo'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare nombre: string

  @column()
  declare descripcion: string | null

  @column()
  declare duracionEstimadaHoras: number | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
