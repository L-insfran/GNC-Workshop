import type StockMovimiento from '#models/stock_movimiento'
import OrdenTrabajo from '#models/orden_trabajo'

export function serializeStockMovimiento(
  movimiento: StockMovimiento,
  ordenes?: Map<string, OrdenTrabajo>
) {
  const orden = movimiento.ordenTrabajoId
    ? ordenes?.get(movimiento.ordenTrabajoId) ?? movimiento.ordenTrabajo
    : undefined

  return {
    id: movimiento.id,
    productoId: movimiento.productoId,
    productoNombre: movimiento.producto?.nombre ?? undefined,
    productoCodigo: movimiento.producto?.codigo ?? undefined,
    tipo: movimiento.tipo,
    cantidad: Number(movimiento.cantidad),
    motivo: movimiento.motivo ?? undefined,
    ordenTrabajoId: movimiento.ordenTrabajoId ?? undefined,
    ordenTrabajoNumero: orden?.numero,
    userId: movimiento.userId ?? undefined,
    userNombre: movimiento.user?.fullName ?? movimiento.user?.email ?? undefined,
    createdAt: movimiento.createdAt.toISO()!,
  }
}

export async function serializeStockMovimientos(movimientos: StockMovimiento[]) {
  const ordenIds = [
    ...new Set(
      movimientos.map((m) => m.ordenTrabajoId).filter((id): id is string => Boolean(id))
    ),
  ]

  const ordenes =
    ordenIds.length > 0
      ? await OrdenTrabajo.query().whereIn('id', ordenIds).whereNull('deleted_at')
      : []

  const ordenesMap = new Map(ordenes.map((o) => [o.id, o]))

  return movimientos.map((m) => serializeStockMovimiento(m, ordenesMap))
}
