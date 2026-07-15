import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class VencimientoNotificacion extends BaseModel {
  static table = 'vencimiento_notificaciones'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare alertaId: string

  @column()
  declare tipo: 'oblea' | 'ph'

  @column()
  declare entidadTipo: 'equipo' | 'cilindro'

  @column()
  declare entidadId: string

  @column()
  declare clienteId: string

  @column()
  declare equipoGncId: string

  @column.date()
  declare fechaVencimiento: DateTime

  @column()
  declare canal: 'whatsapp' | 'email'

  @column()
  declare modo: 'asistido' | 'automatico'

  @column()
  declare estado: 'enviado' | 'fallido' | 'omitido'

  @column()
  declare destino: string | null

  @column()
  declare mensaje: string | null

  @column()
  declare providerMessageId: string | null

  @column()
  declare notificadoPor: string | null

  @column.dateTime()
  declare notificadoAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
