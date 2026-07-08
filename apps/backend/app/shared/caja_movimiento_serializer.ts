import type CajaMovimiento from '#models/caja_movimiento'
import Factura from '#models/factura'
import OrdenTrabajo from '#models/orden_trabajo'

export function serializeCajaMovimiento(
  movimiento: CajaMovimiento,
  facturas?: Map<string, Factura>,
  ordenes?: Map<string, OrdenTrabajo>
) {
  const factura = movimiento.facturaId ? facturas?.get(movimiento.facturaId) : undefined
  const orden = movimiento.ordenTrabajoId ? ordenes?.get(movimiento.ordenTrabajoId) : undefined

  return {
    id: movimiento.id,
    cajaId: movimiento.cajaId,
    tipo: movimiento.tipo,
    monto: Number(movimiento.monto),
    concepto: movimiento.concepto,
    facturaId: movimiento.facturaId ?? undefined,
    facturaNumero: factura?.numero,
    ordenTrabajoId: movimiento.ordenTrabajoId ?? undefined,
    ordenTrabajoNumero: orden?.numero,
    userId: movimiento.userId ?? undefined,
    userNombre: movimiento.user?.fullName,
    createdAt: movimiento.createdAt.toISO()!,
  }
}

export async function serializeCajaMovimientos(movimientos: CajaMovimiento[]) {
  const facturaIds = [
    ...new Set(movimientos.map((m) => m.facturaId).filter((id): id is string => Boolean(id))),
  ]
  const ordenIds = [
    ...new Set(
      movimientos.map((m) => m.ordenTrabajoId).filter((id): id is string => Boolean(id))
    ),
  ]

  const [facturas, ordenes] = await Promise.all([
    facturaIds.length > 0 ? Factura.query().whereIn('id', facturaIds) : Promise.resolve([]),
    ordenIds.length > 0 ? OrdenTrabajo.query().whereIn('id', ordenIds) : Promise.resolve([]),
  ])

  const facturasMap = new Map(facturas.map((f) => [f.id, f]))
  const ordenesMap = new Map(ordenes.map((o) => [o.id, o]))

  return movimientos.map((m) => serializeCajaMovimiento(m, facturasMap, ordenesMap))
}
