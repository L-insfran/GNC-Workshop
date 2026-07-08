import type KitTrabajoItem from '#models/kit_trabajo_item'

export function serializeKitTrabajoItem(item: KitTrabajoItem) {
  return {
    id: item.id,
    tipoTrabajoId: item.tipoTrabajoId,
    tipo: item.tipo,
    productoId: item.productoId ?? undefined,
    productoNombre: item.producto?.nombre ?? undefined,
    descripcion: item.descripcion,
    cantidad: Number(item.cantidad),
    precioUnitario:
      item.precioUnitario === null || item.precioUnitario === undefined
        ? null
        : Number(item.precioUnitario),
    esEstimado: item.esEstimado,
    orden: Number(item.orden),
    createdAt: item.createdAt.toISO()!,
    updatedAt: item.updatedAt.toISO()!,
  }
}

export function serializeKitTrabajoItems(items: KitTrabajoItem[]) {
  return items.map(serializeKitTrabajoItem)
}
