export type TurnoEstado = 'pendiente' | 'confirmado' | 'cancelado' | 'completado'

export interface ITurno {
  id: string
  clienteId: string
  clienteNombre?: string
  vehiculoId?: string
  vehiculoPatente?: string
  fechaHora: string
  estado: TurnoEstado
  notas?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTurnoDTO {
  clienteId: string
  vehiculoId?: string
  fechaHora: string
  estado?: TurnoEstado
  notas?: string
}

export type UpdateTurnoDTO = Partial<CreateTurnoDTO>
