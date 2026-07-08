import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import OrdenTrabajo from '#models/orden_trabajo'
import User from '#models/user'

export default class OtControlCalidad extends BaseModel {
  static table = 'ot_control_calidad'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare ordenTrabajoId: string

  @column()
  declare sinFugas: boolean

  @column()
  declare presionReguladorOk: boolean

  @column()
  declare valvulasSeguridadOk: boolean

  @column()
  declare estanqueidadOk: boolean

  @column()
  declare documentacionCompleta: boolean

  @column()
  declare observaciones: string | null

  @column()
  declare aprobadoPorId: string | null

  @column.dateTime()
  declare aprobadoAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => OrdenTrabajo)
  declare ordenTrabajo: BelongsTo<typeof OrdenTrabajo>

  @belongsTo(() => User, { foreignKey: 'aprobadoPorId' })
  declare aprobadoPor: BelongsTo<typeof User>

  get completo(): boolean {
    return (
      this.sinFugas &&
      this.presionReguladorOk &&
      this.valvulasSeguridadOk &&
      this.estanqueidadOk &&
      this.documentacionCompleta
    )
  }
}
