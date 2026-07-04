import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AuditLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string | null

  @column()
  declare action: string

  @column()
  declare entityType: string

  @column()
  declare entityId: string | null

  @column()
  declare oldValues: Record<string, unknown> | null

  @column()
  declare newValues: Record<string, unknown> | null

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
