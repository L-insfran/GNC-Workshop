import type { CilindroEstado, EquipoEstado } from './equipos-gnc'
import type { OrdenEstado } from './ordenes-trabajo'

export interface IEquipoGncCilindroFicha {
  id: string
  numeroSerie: string
  capacidadM3: number
  marca: string
  fechaUltimaPh: string
  fechaVencimientoPh: string
  estado: CilindroEstado
  posicion: number
  phVencida: boolean
}

export interface IEquipoGncOrdenFicha {
  id: string
  numero: string
  estado: OrdenEstado
  tipoTrabajoNombre?: string
  fechaIngreso: string
  totalEstimado?: number
}

export interface IEquipoGncFichaOperativa {
  id: string
  vehiculoId: string
  vehiculoPatente: string
  clienteId: string
  clienteNombre: string
  numeroSerieEquipo: string
  marcaRegulador: string
  modeloRegulador: string
  fechaInstalacion: string
  fechaVencimientoOblea: string
  estado: EquipoEstado
  certificadorCrpc?: string
  notas?: string
  obleaVencida: boolean
  phVencida: boolean
  cilindros: IEquipoGncCilindroFicha[]
  ordenesRecientes: IEquipoGncOrdenFicha[]
}
