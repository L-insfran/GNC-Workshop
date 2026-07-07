import type { IFactura } from '@gnc/shared-types'
import type Factura from '#models/factura'
import type CajaMovimiento from '#models/caja_movimiento'

interface SerializeFacturaOptions {
  cobro?: CajaMovimiento | null
  notaCredito?: Factura | null
}

export function serializeFactura(
  factura: Factura,
  cobroOrOptions?: CajaMovimiento | null | SerializeFacturaOptions
): IFactura {
  const options: SerializeFacturaOptions =
    cobroOrOptions && 'cobro' in cobroOrOptions
      ? cobroOrOptions
      : { cobro: cobroOrOptions ?? null }

  const cobro = options.cobro ?? null
  const notaCredito = options.notaCredito ?? null
  const esEmitida = factura.estado === 'emitida'

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
    total: Number(factura.total),
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
    cobrada: Boolean(cobro),
    cobroFecha: cobro?.createdAt.toISO() ?? undefined,
    puedeEmitirNotaCredito:
      esEmitida && factura.tipo !== 'nota_credito' && !notaCredito,
    notaCreditoId: notaCredito?.id,
    createdAt: factura.createdAt.toISO()!,
  }
}
