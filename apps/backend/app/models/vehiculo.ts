import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Cliente from '#models/cliente'
import VehiculoMarca from '#models/vehiculo_marca'
import VehiculoModelo from '#models/vehiculo_modelo'
import EquipoGnc from '#models/equipo_gnc'

export default class Vehiculo extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare clienteId: string

  @column()
  declare patente: string

  @column()
  declare marcaId: string

  @column()
  declare modeloId: string

  @column()
  declare anio: number

  @column()
  declare color: string | null

  @column()
  declare tipoCombustible: 'nafta' | 'diesel' | 'gnc' | 'dual'

  @column()
  declare numeroMotor: string | null

  @column()
  declare numeroChasis: string | null

  @column()
  declare kilometraje: number | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>

  @belongsTo(() => VehiculoMarca, { foreignKey: 'marcaId' })
  declare marca: BelongsTo<typeof VehiculoMarca>

  @belongsTo(() => VehiculoModelo, { foreignKey: 'modeloId' })
  declare modelo: BelongsTo<typeof VehiculoModelo>

  @hasMany(() => EquipoGnc)
  declare equiposGnc: HasMany<typeof EquipoGnc>
}
