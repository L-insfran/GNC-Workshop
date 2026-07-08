import type { OtItemTipo } from './ot-items'

export interface IKitTrabajoItem {
  id: string
  tipoTrabajoId: string
  tipo: OtItemTipo
  productoId?: string
  productoNombre?: string
  descripcion: string
  cantidad: number
  precioUnitario?: number | null
  esEstimado: boolean
  orden: number
  createdAt: string
  updatedAt: string
}

export interface CreateKitItemDTO {
  tipo: OtItemTipo
  productoId?: string
  descripcion: string
  cantidad: number
  precioUnitario?: number | null
  esEstimado?: boolean
  orden?: number
}

export interface UpdateKitItemDTO {
  tipo?: OtItemTipo
  productoId?: string | null
  descripcion?: string
  cantidad?: number
  precioUnitario?: number | null
  esEstimado?: boolean
  orden?: number
}
