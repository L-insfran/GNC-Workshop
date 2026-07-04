import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Cliente from '#models/cliente'
import Vehiculo from '#models/vehiculo'
import EquipoGnc from '#models/equipo_gnc'
import TipoTrabajo from '#models/tipo_trabajo'
import User from '#models/user'

export default class OrdenTrabajo extends BaseModel {
  static table = 'ordenes_trabajo'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare numero: string

  @column()
  declare clienteId: string

  @column()
  declare vehiculoId: string

  @column()
  declare equipoGncId: string | null

  @column()
  declare tipoTrabajoId: string

  @column()
  declare estado:
    | 'borrador'
    | 'recepcion'
    | 'en_taller'
    | 'en_espera_repuesto'
    | 'control_calidad'
    | 'finalizada'
    | 'entregada'
    | 'cancelada'

  @column()
  declare prioridad: 'baja' | 'normal' | 'alta' | 'urgente'

  @column.dateTime()
  declare fechaIngreso: DateTime

  @column.dateTime()
  declare fechaEstimadaEntrega: DateTime | null

  @column.dateTime()
  declare fechaEntregaReal: DateTime | null

  @column()
  declare mecanicoAsignadoId: string | null

  @column()
  declare recepcionistaId: string

  @column()
  declare kilometrajeIngreso: number | null

  @column()
  declare descripcionProblema: string | null

  @column()
  declare observacionesInternas: string | null

  @column()
  declare totalEstimado: number | null

  @column()
  declare totalFinal: number | null

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

  @belongsTo(() => EquipoGnc)
  declare equipoGnc: BelongsTo<typeof EquipoGnc>

  @belongsTo(() => TipoTrabajo)
  declare tipoTrabajo: BelongsTo<typeof TipoTrabajo>

  @belongsTo(() => User, { foreignKey: 'mecanicoAsignadoId' })
  declare mecanico: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'recepcionistaId' })
  declare recepcionista: BelongsTo<typeof User>
}
