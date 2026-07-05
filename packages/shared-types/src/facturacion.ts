export type FacturaTipo = 'factura_a' | 'factura_b' | 'factura_c' | 'nota_credito'
export type FacturaEstado = 'borrador' | 'emitida' | 'anulada'

export interface IFacturaItem {
  id: string
  facturaId: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface IFactura {
  id: string
  numero: string
  clienteId: string
  clienteNombre?: string
  ordenTrabajoId?: string
  tipo: FacturaTipo
  subtotal: number
  iva: number
  total: number
  estado: FacturaEstado
  fechaEmision: string
  items?: IFacturaItem[]
  createdAt: string
}

export interface CreateFacturaItemDTO {
  descripcion: string
  cantidad: number
  precioUnitario: number
}

export interface CreateFacturaDTO {
  clienteId: string
  ordenTrabajoId?: string
  tipo: FacturaTipo
  items: CreateFacturaItemDTO[]
  emitir?: boolean
}
