export type FacturaEstadoCobro = 'pendiente' | 'parcial' | 'cobrada'

export type OrdenResumenCobroEstado =
  | 'no_aplica'
  | 'sin_factura'
  | 'borrador'
  | 'pendiente'
  | 'parcial'
  | 'cobrada'
  | 'anulada'

export interface IOrdenCobroResumen {
  estado: OrdenResumenCobroEstado
  facturaId?: string
  facturaNumero?: string
  totalFacturado?: number
  totalCobrado?: number
  saldoPendiente?: number
}

const TOLERANCIA_MONTO = 0.01

export function calcularEstadoCobro(total: number, totalCobrado: number): FacturaEstadoCobro {
  if (totalCobrado <= TOLERANCIA_MONTO) {
    return 'pendiente'
  }
  if (totalCobrado >= total - TOLERANCIA_MONTO) {
    return 'cobrada'
  }
  return 'parcial'
}

export function calcularSaldoPendiente(total: number, totalCobrado: number): number {
  return Math.max(0, Number((total - totalCobrado).toFixed(2)))
}

export function estaFacturaCobrada(total: number, totalCobrado: number): boolean {
  return calcularEstadoCobro(total, totalCobrado) === 'cobrada'
}

export function validarMontoCobro(
  totalFactura: number,
  totalCobrado: number,
  montoNuevo: number
): void {
  if (montoNuevo <= 0) {
    throw new Error('MONTO_COBRO_INVALIDO')
  }

  const saldo = calcularSaldoPendiente(totalFactura, totalCobrado)
  if (montoNuevo > saldo + TOLERANCIA_MONTO) {
    throw new Error('COBRO_EXCEDE_TOTAL')
  }
}
