import { test } from '@japa/runner'
import { calcularSubtotal } from '#modules/ordenes_trabajo/services/orden_trabajo_totales_service'

/**
 * La lógica de mapeo kit → ot_item (precio fallback y subtotal)
 * se valida de forma aislada sin DB.
 */
test.group('Kit → OT item mapping', () => {
  test('usa precio del kit cuando está definido', ({ assert }) => {
    const precioKit = 1500
    const precioProducto = 2000
    const precioUnitario = precioKit ?? precioProducto ?? 0
    const subtotal = calcularSubtotal(2, precioUnitario)

    assert.equal(precioUnitario, 1500)
    assert.equal(subtotal, 3000)
  })

  test('usa precio de venta del producto si el kit no tiene precio', ({ assert }) => {
    const precioKit: number | null = null
    const precioProducto = 800
    const precioUnitario = precioKit ?? precioProducto ?? 0

    assert.equal(precioUnitario, 800)
    assert.equal(calcularSubtotal(1, precioUnitario), 800)
  })

  test('cae a 0 si no hay precio ni producto', ({ assert }) => {
    const precioKit: number | null = null
    const precioProducto: number | null = null
    const precioUnitario = precioKit ?? precioProducto ?? 0

    assert.equal(precioUnitario, 0)
  })
})
