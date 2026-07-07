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
  facturaReferenciaId?: string
  tipo: FacturaTipo
  subtotal: number
  iva: number
  total: number
  estado: FacturaEstado
  fechaEmision: string
  items?: IFacturaItem[]
  cobrada?: boolean
  cobroFecha?: string
  puedeEmitirNotaCredito?: boolean
  notaCreditoId?: string
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
  facturaReferenciaId?: string
  tipo: FacturaTipo
  items: CreateFacturaItemDTO[]
  emitir?: boolean
}

export interface IFacturaBorradorPreview extends CreateFacturaDTO {
  ordenNumero?: string
  clienteNombre?: string
}

export interface IFacturaVinculadaOT {
  factura: IFactura
  cobrada: boolean
  cobroMovimientoId?: string
  puedeEmitirNotaCredito: boolean
  notaCreditoId?: string
  puedeGenerarFactura: boolean
}
