import type StockMovimiento from '#models/stock_movimiento'

export function serializeStockMovimiento(movimiento: StockMovimiento) {
  return {
    id: movimiento.id,
    productoId: movimiento.productoId,
    productoNombre: movimiento.producto?.nombre ?? undefined,
    productoCodigo: movimiento.producto?.codigo ?? undefined,
    tipo: movimiento.tipo,
    cantidad: Number(movimiento.cantidad),
    motivo: movimiento.motivo ?? undefined,
    userId: movimiento.userId ?? undefined,
    userNombre: movimiento.user?.fullName ?? movimiento.user?.email ?? undefined,
    createdAt: movimiento.createdAt.toISO()!,
  }
}

export function serializeStockMovimientos(movimientos: StockMovimiento[]) {
  return movimientos.map(serializeStockMovimiento)
}
