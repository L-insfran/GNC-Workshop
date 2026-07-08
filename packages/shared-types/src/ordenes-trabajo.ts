import type { IOrdenCobroResumen } from './facturacion'
import type { IOrdenMargenResumen } from './ot-items'
import type { IOtSenaResumen } from './ot-sena'

export type OrdenEstado =
  | 'borrador'
  | 'recepcion'
  | 'en_taller'
  | 'en_espera_repuesto'
  | 'control_calidad'
  | 'finalizada'
  | 'entregada'
  | 'cancelada'

export type OrdenPrioridad = 'baja' | 'normal' | 'alta' | 'urgente'

export const ORDEN_TRANSICIONES_PERMITIDAS: Record<OrdenEstado, OrdenEstado[]> = {
  borrador: ['recepcion'],
  recepcion: ['en_taller', 'cancelada'],
  en_taller: ['en_espera_repuesto', 'control_calidad', 'cancelada'],
  en_espera_repuesto: ['en_taller'],
  control_calidad: ['finalizada', 'en_taller'],
  finalizada: ['entregada'],
  entregada: [],
  cancelada: [],
}

export function getOrdenEstadosSiguientes(estado: OrdenEstado): OrdenEstado[] {
  return ORDEN_TRANSICIONES_PERMITIDAS[estado] ?? []
}

export interface IOrdenTrabajo {
  id: string
  numero: string
  clienteId: string
  clienteNombre?: string
  vehiculoId: string
  vehiculoPatente?: string
  vehiculoMarcaNombre?: string
  vehiculoModeloNombre?: string
  equipoGncId?: string
  equipoGncNumeroSerie?: string
  tipoTrabajoId: string
  tipoTrabajoNombre?: string
  estado: OrdenEstado
  prioridad: OrdenPrioridad
  fechaIngreso: string
  fechaEstimadaEntrega?: string
  fechaEntregaReal?: string
  mecanicoAsignadoId?: string
  mecanicoNombre?: string
  recepcionistaId: string
  kilometrajeIngreso?: number
  descripcionProblema?: string
  observacionesInternas?: string
  totalEstimado?: number
  totalFinal?: number
  resumenCobro?: IOrdenCobroResumen
  resumenMargen?: IOrdenMargenResumen
  resumenSena?: IOtSenaResumen
  createdAt: string
  updatedAt: string
}

export interface CreateOrdenTrabajoDTO {
  clienteId: string
  vehiculoId: string
  equipoGncId?: string
  tipoTrabajoId: string
  prioridad?: OrdenPrioridad
  fechaEstimadaEntrega?: string
  mecanicoAsignadoId?: string
  kilometrajeIngreso?: number
  descripcionProblema?: string
  observacionesInternas?: string
  montoSena?: number
}

export interface UpdateOrdenEstadoDTO {
  estado: OrdenEstado
  observacion?: string
  mecanicoAsignadoId?: string
}

export interface ITipoTrabajo {
  id: string
  nombre: string
  descripcion?: string
  duracionEstimadaHoras?: number
  isActive: boolean
}
