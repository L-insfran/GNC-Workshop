export type TipoCombustible = 'nafta' | 'diesel' | 'gnc' | 'dual'

export interface IVehiculo {
  id: string
  clienteId: string
  patente: string
  marcaId: string
  marcaNombre?: string
  modeloId: string
  modeloNombre?: string
  anio: number
  color?: string
  tipoCombustible: TipoCombustible
  numeroMotor?: string
  numeroChasis?: string
  kilometraje?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateVehicleDTO {
  clienteId: string
  patente: string
  marcaId: string
  modeloId: string
  anio: number
  color?: string
  tipoCombustible: TipoCombustible
  numeroMotor?: string
  numeroChasis?: string
  kilometraje?: number
}

export type UpdateVehicleDTO = Partial<Omit<CreateVehicleDTO, 'clienteId'>>

export interface IVehiculoMarca {
  id: string
  nombre: string
}

export interface IVehiculoModelo {
  id: string
  marcaId: string
  nombre: string
}
