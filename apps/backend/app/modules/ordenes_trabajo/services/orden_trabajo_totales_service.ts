import OtItem from '#models/ot_item'
import OrdenTrabajo from '#models/orden_trabajo'

const IVA_RATE = 0.21

export function calcularSubtotal(cantidad: number, precioUnitario: number): number {
  return Number((cantidad * precioUnitario).toFixed(2))
}

export async function recalcularTotalesOrden(ordenTrabajoId: string): Promise<{
  totalEstimado: number
  totalFinal: number
}> {
  const items = await OtItem.query()
    .where('orden_trabajo_id', ordenTrabajoId)
    .whereNull('deleted_at')

  const totalEstimado = Number(
    items
      .filter((item) => item.esEstimado)
      .reduce((acc, item) => acc + Number(item.subtotal), 0)
      .toFixed(2)
  )

  const totalFinal = Number(
    items.reduce((acc, item) => acc + Number(item.subtotal), 0).toFixed(2)
  )

  await OrdenTrabajo.query().where('id', ordenTrabajoId).update({
    totalEstimado,
    totalFinal,
  })

  return { totalEstimado, totalFinal }
}

export function calcularIvaEstimado(totalFinal: number): number {
  return Number((totalFinal * IVA_RATE).toFixed(2))
}
