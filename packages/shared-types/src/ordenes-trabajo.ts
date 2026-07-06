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
}

export interface UpdateOrdenEstadoDTO {
  estado: OrdenEstado
  observacion?: string
}

export interface ITipoTrabajo {
  id: string
  nombre: string
  descripcion?: string
  duracionEstimadaHoras?: number
  isActive: boolean
}
