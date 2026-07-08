import type { EquipoEstado } from './equipos-gnc'
import type { OrdenEstado } from './ordenes-trabajo'

export interface IClienteEquipoResumen {
  id: string
  numeroSerieEquipo: string
  estado: EquipoEstado
  fechaVencimientoOblea: string
  obleaVencida: boolean
  phVencida: boolean
}

export interface IClienteVehiculoFicha {
  id: string
  patente: string
  marcaNombre?: string
  modeloNombre?: string
  anio: number
  equipos: IClienteEquipoResumen[]
}

export interface IClienteOrdenFicha {
  id: string
  numero: string
  estado: OrdenEstado
  tipoTrabajoNombre?: string
  vehiculoPatente?: string
  fechaIngreso: string
  totalEstimado?: number
  totalSena?: number
}

export interface IClienteFichaOperativa {
  vehiculos: IClienteVehiculoFicha[]
  ordenesRecientes: IClienteOrdenFicha[]
}
