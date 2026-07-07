import type OtItem from '#models/ot_item'

export function serializeOtItem(item: OtItem) {
  return {
    id: item.id,
    ordenTrabajoId: item.ordenTrabajoId,
    tipo: item.tipo,
    productoId: item.productoId ?? undefined,
    productoNombre: item.producto?.nombre ?? undefined,
    descripcion: item.descripcion,
    cantidad: Number(item.cantidad),
    precioUnitario: Number(item.precioUnitario),
    subtotal: Number(item.subtotal),
    esEstimado: item.esEstimado,
    createdAt: item.createdAt.toISO()!,
    updatedAt: item.updatedAt.toISO()!,
  }
}

export function serializeOtItems(items: OtItem[]) {
  return items.map(serializeOtItem)
}
