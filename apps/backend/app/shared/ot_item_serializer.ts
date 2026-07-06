import type OtItem from '#models/ot_item'

export function serializeOtItem(item: OtItem) {
  const data = item.serialize() as Record<string, unknown>

  return {
    ...data,
    productoNombre: item.producto?.nombre ?? null,
  }
}

export function serializeOtItems(items: OtItem[]) {
  return items.map(serializeOtItem)
}
