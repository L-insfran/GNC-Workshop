import type { IFactura, ICajaMovimientoResumen } from '@gnc/shared-types'
import type Factura from '#models/factura'
import type CajaMovimiento from '#models/caja_movimiento'
import {
  calcularEstadoCobro,
  calcularSaldoPendiente,
  estaFacturaCobrada,
} from '#shared/factura_cobro_util'

interface SerializeFacturaOptions {
  cobros?: CajaMovimiento[]
  cobro?: CajaMovimiento | null
  notaCredito?: Factura | null
}

function mapCobros(cobros: CajaMovimiento[]): ICajaMovimientoResumen[] {
  return cobros.map((cobro) => ({
    id: cobro.id,
    monto: Number(cobro.monto),
    concepto: cobro.concepto,
    createdAt: cobro.createdAt.toISO()!,
  }))
}

export function serializeFactura(
  factura: Factura,
  cobroOrOptions?: CajaMovimiento[] | null | SerializeFacturaOptions
): IFactura {
  const options: SerializeFacturaOptions = Array.isArray(cobroOrOptions)
    ? { cobros: cobroOrOptions }
    : cobroOrOptions && ('cobros' in cobroOrOptions || 'cobro' in cobroOrOptions)
      ? cobroOrOptions
      : cobroOrOptions
        ? { cobro: cobroOrOptions }
        : {}

  const cobros =
    options.cobros ??
    (options.cobro ? [options.cobro] : [])
  const notaCredito = options.notaCredito ?? null
  const esEmitida = factura.estado === 'emitida'
  const total = Number(factura.total)
  const totalCobrado = cobros.reduce((acc, cobro) => acc + Number(cobro.monto), 0)
  const estadoCobro = esEmitida ? calcularEstadoCobro(total, totalCobrado) : undefined
  const ultimoCobro = cobros.length > 0 ? cobros[cobros.length - 1] : null

  return {
    id: factura.id,
    numero: factura.numero,
    clienteId: factura.clienteId,
    clienteNombre: factura.cliente?.razonSocial,
    ordenTrabajoId: factura.ordenTrabajoId ?? undefined,
    facturaReferenciaId: factura.facturaReferenciaId ?? undefined,
    tipo: factura.tipo,
    subtotal: Number(factura.subtotal),
    iva: Number(factura.iva),
    total,
    estado: factura.estado,
    fechaEmision: factura.fechaEmision.toISO()!,
    items: factura.items?.map((item) => ({
      id: item.id,
      facturaId: item.facturaId,
      descripcion: item.descripcion,
      cantidad: Number(item.cantidad),
      precioUnitario: Number(item.precioUnitario),
      subtotal: Number(item.subtotal),
    })),
    cobrada: esEmitida ? estaFacturaCobrada(total, totalCobrado) : false,
    estadoCobro,
    totalCobrado: esEmitida ? Number(totalCobrado.toFixed(2)) : undefined,
    saldoPendiente: esEmitida ? calcularSaldoPendiente(total, totalCobrado) : undefined,
    cobroFecha: ultimoCobro?.createdAt.toISO() ?? undefined,
    cobros: cobros.length > 0 ? mapCobros(cobros) : undefined,
    puedeEmitirNotaCredito: esEmitida && factura.tipo !== 'nota_credito' && !notaCredito,
    notaCreditoId: notaCredito?.id,
    createdAt: factura.createdAt.toISO()!,
  }
}

export function buildCobroFacturaResumen(total: number, cobros: CajaMovimiento[]) {
  const totalCobrado = cobros.reduce((acc, cobro) => acc + Number(cobro.monto), 0)
  const estadoCobro = calcularEstadoCobro(total, totalCobrado)

  return {
    totalCobrado: Number(totalCobrado.toFixed(2)),
    saldoPendiente: calcularSaldoPendiente(total, totalCobrado),
    estadoCobro,
    cobrada: estadoCobro === 'cobrada',
    ultimoCobroId: cobros.length > 0 ? cobros[cobros.length - 1].id : undefined,
  }
}
