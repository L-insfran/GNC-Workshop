import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { OrdenEstado } from '@gnc/shared-types'
import OrdenTrabajo from '#models/orden_trabajo'
import User from '#models/user'

export default class OtEstadoHistorial extends BaseModel {
  static table = 'ot_estados_historial'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare ordenTrabajoId: string

  @column()
  declare estadoAnterior: OrdenEstado | null

  @column()
  declare estadoNuevo: OrdenEstado

  @column()
  declare userId: string | null

  @column()
  declare observacion: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => OrdenTrabajo)
  declare ordenTrabajo: BelongsTo<typeof OrdenTrabajo>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
