import type { EquipoEstado } from './equipos-gnc'
import type { FacturaEstado, FacturaEstadoCobro } from './facturacion'
import type { OrdenEstado } from './ordenes-trabajo'
import type { TurnoEstado } from './agenda'

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

export interface IClienteTurnoFicha {
  id: string
  fechaHora: string
  estado: TurnoEstado
  vehiculoPatente?: string
  tipoTrabajoNombre?: string
  ordenTrabajoId?: string
  ordenTrabajoNumero?: string
}

export interface IClienteFacturaFicha {
  id: string
  numero: string
  estado: FacturaEstado
  estadoCobro?: FacturaEstadoCobro
  total: number
  saldoPendiente?: number
  fechaEmision: string
  ordenTrabajoId?: string
}

export interface IClienteFichaOperativa {
  vehiculos: IClienteVehiculoFicha[]
  ordenesRecientes: IClienteOrdenFicha[]
  turnosProximos: IClienteTurnoFicha[]
  facturasRecientes: IClienteFacturaFicha[]
}
