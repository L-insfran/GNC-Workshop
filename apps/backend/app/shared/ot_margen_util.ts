import type { IOtMargenResumen, IOrdenMargenResumen } from '@gnc/shared-types'
import type OtItem from '#models/ot_item'

function roundMoney(value: number): number {
  return Number(value.toFixed(2))
}

export function calcularMargenOtItems(items: OtItem[]): IOtMargenResumen {
  let ingresoServicios = 0
  let ingresoRepuestos = 0
  let costoRepuestos = 0

  for (const item of items) {
    const subtotal = Number(item.subtotal)

    if (item.tipo === 'servicio') {
      ingresoServicios += subtotal
      continue
    }

    ingresoRepuestos += subtotal

    if (item.productoId && item.producto) {
      const cantidad = Number(item.cantidad)
      const precioCompra = Number(item.producto.precioCompra)
      costoRepuestos += cantidad * precioCompra
    }
  }

  ingresoServicios = roundMoney(ingresoServicios)
  ingresoRepuestos = roundMoney(ingresoRepuestos)
  costoRepuestos = roundMoney(costoRepuestos)

  const ingresoTotal = roundMoney(ingresoServicios + ingresoRepuestos)
  const margenBruto = roundMoney(ingresoTotal - costoRepuestos)
  const margenPorcentaje =
    ingresoTotal > 0 ? Number(((margenBruto / ingresoTotal) * 100).toFixed(1)) : null

  return {
    ingresoServicios,
    ingresoRepuestos,
    ingresoTotal,
    costoRepuestos,
    margenBruto,
    margenPorcentaje,
  }
}

export function calcularMargenItem(item: OtItem): number | null {
  const subtotal = Number(item.subtotal)

  if (item.tipo === 'servicio') {
    return subtotal
  }

  if (!item.productoId || !item.producto) {
    return null
  }

  const costoSubtotal = roundMoney(Number(item.cantidad) * Number(item.producto.precioCompra))
  return roundMoney(subtotal - costoSubtotal)
}

export function toOrdenMargenResumen(margen: IOtMargenResumen): IOrdenMargenResumen {
  return {
    ingresoTotal: margen.ingresoTotal,
    costoRepuestos: margen.costoRepuestos,
    margenBruto: margen.margenBruto,
    margenPorcentaje: margen.margenPorcentaje,
  }
}
