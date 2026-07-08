import type { EquipoEstado } from './equipos-gnc'
import type { OrdenEstado } from './ordenes-trabajo'
import type { TipoCombustible } from './vehiculos'

export interface IVehiculoEquipoResumen {
  id: string
  numeroSerieEquipo: string
  estado: EquipoEstado
  fechaVencimientoOblea: string
  obleaVencida: boolean
  phVencida: boolean
}

export interface IVehiculoOrdenFicha {
  id: string
  numero: string
  estado: OrdenEstado
  tipoTrabajoNombre?: string
  equipoGncNumeroSerie?: string
  fechaIngreso: string
  totalEstimado?: number
  totalSena?: number
}

export interface IVehiculoFichaOperativa {
  id: string
  clienteId: string
  clienteNombre: string
  patente: string
  marcaNombre?: string
  modeloNombre?: string
  anio: number
  color?: string
  tipoCombustible: TipoCombustible
  kilometraje?: number
  isActive: boolean
  equipos: IVehiculoEquipoResumen[]
  ordenesRecientes: IVehiculoOrdenFicha[]
}
