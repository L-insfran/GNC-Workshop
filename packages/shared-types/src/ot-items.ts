export type OtItemTipo = 'servicio' | 'repuesto' | 'material'

export const OT_ITEM_EDITABLE_ESTADOS = [
  'borrador',
  'recepcion',
  'en_taller',
  'en_espera_repuesto',
  'control_calidad',
] as const

export const OT_ITEM_DELETABLE_ESTADOS = [
  'borrador',
  'recepcion',
  'en_taller',
  'en_espera_repuesto',
] as const

export interface IOtItem {
  id: string
  ordenTrabajoId: string
  tipo: OtItemTipo
  productoId?: string
  productoNombre?: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  esEstimado: boolean
  createdAt: string
  updatedAt: string
}

export interface IOtPresupuestoResumen {
  items: IOtItem[]
  totalEstimado: number
  totalFinal: number
  ivaEstimado: number
  totalConIva: number
  puedeEditar: boolean
  puedeEliminar: boolean
}

export interface CreateOtItemDTO {
  tipo: OtItemTipo
  productoId?: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  esEstimado?: boolean
}

export interface UpdateOtItemDTO {
  tipo?: OtItemTipo
  productoId?: string | null
  descripcion?: string
  cantidad?: number
  precioUnitario?: number
  esEstimado?: boolean
}
