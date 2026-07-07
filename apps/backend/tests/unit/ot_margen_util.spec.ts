import { test } from '@japa/runner'
import { calcularMargenItem, calcularMargenOtItems } from '#shared/ot_margen_util'
import type OtItem from '#models/ot_item'
import type Producto from '#models/producto'

function createItemMock(overrides: Partial<OtItem> = {}): OtItem {
  return {
    id: 'item-1',
    tipo: 'servicio',
    cantidad: 1,
    subtotal: 1000,
    productoId: null,
    producto: undefined,
    ...overrides,
  } as OtItem
}

function createProductoMock(precioCompra: number): Producto {
  return { precioCompra } as Producto
}

test.group('OT margen util', () => {
  test('servicios aportan margen igual al subtotal', ({ assert }) => {
    const item = createItemMock({ tipo: 'servicio', subtotal: 5000 })
    assert.equal(calcularMargenItem(item), 5000)
  })

  test('repuesto con producto descuenta precio de compra', ({ assert }) => {
    const item = createItemMock({
      tipo: 'repuesto',
      cantidad: 2,
      subtotal: 1000,
      productoId: 'prod-1',
      producto: createProductoMock(300),
    })
    assert.equal(calcularMargenItem(item), 400)
  })

  test('repuesto sin producto no tiene margen calculable', ({ assert }) => {
    const item = createItemMock({ tipo: 'repuesto', subtotal: 1000 })
    assert.isNull(calcularMargenItem(item))
  })

  test('calcularMargenOtItems agrega servicios y costos de repuestos', ({ assert }) => {
    const items = [
      createItemMock({ tipo: 'servicio', subtotal: 8000 }),
      createItemMock({
        tipo: 'repuesto',
        cantidad: 1,
        subtotal: 1200,
        productoId: 'prod-1',
        producto: createProductoMock(700),
      }),
      createItemMock({ tipo: 'material', cantidad: 3, subtotal: 600, productoId: 'prod-2', producto: createProductoMock(100) }),
    ]

    const margen = calcularMargenOtItems(items)

    assert.equal(margen.ingresoServicios, 8000)
    assert.equal(margen.ingresoRepuestos, 1800)
    assert.equal(margen.ingresoTotal, 9800)
    assert.equal(margen.costoRepuestos, 1000)
    assert.equal(margen.margenBruto, 8800)
    assert.equal(margen.margenPorcentaje, 89.8)
  })

  test('margen porcentaje es null sin ingresos', ({ assert }) => {
    const margen = calcularMargenOtItems([])
    assert.equal(margen.ingresoTotal, 0)
    assert.isNull(margen.margenPorcentaje)
  })
})
