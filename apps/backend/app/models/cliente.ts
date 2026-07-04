import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Vehiculo from '#models/vehiculo'

export default class Cliente extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare tipo: 'persona_fisica' | 'persona_juridica'

  @column()
  declare razonSocial: string

  @column()
  declare nombre: string | null

  @column()
  declare apellido: string | null

  @column()
  declare documentoTipo: 'dni' | 'cuit' | 'cuil'

  @column()
  declare documentoNumero: string

  @column()
  declare email: string | null

  @column()
  declare telefono: string | null

  @column()
  declare telefonoAlt: string | null

  @column()
  declare condicionIva: 'responsable_inscripto' | 'monotributo' | 'consumidor_final' | 'exento'

  @column()
  declare notas: string | null

  @column()
  declare isActive: boolean

  @column()
  declare createdBy: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @hasMany(() => Vehiculo)
  declare vehiculos: HasMany<typeof Vehiculo>
}
