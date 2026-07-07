import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import type Factura from '#models/factura'
import type CajaMovimiento from '#models/caja_movimiento'
import { serializeFactura } from '#shared/factura_serializer'
import { validarMontoCobro } from '#shared/factura_cobro_util'

const FACTURA_ESTADOS_ACTIVOS = ['borrador', 'emitida'] as const

function esFacturaActiva(estado: string): boolean {
  return FACTURA_ESTADOS_ACTIVOS.includes(estado as (typeof FACTURA_ESTADOS_ACTIVOS)[number])
}

function puedeGenerarFacturaEnOT(facturaActiva: { estado: string } | null): boolean {
  return !facturaActiva || !esFacturaActiva(facturaActiva.estado)
}

function puedeEmitirNotaCredito(factura: {
  estado: string
  tipo: string
  notaCreditoExistente: boolean
}): boolean {
  return (
    factura.estado === 'emitida' &&
    factura.tipo !== 'nota_credito' &&
    !factura.notaCreditoExistente
  )
}

function createFacturaMock(
  overrides: Partial<{
    id: string
    numero: string
    clienteId: string
    ordenTrabajoId: string | null
    facturaReferenciaId: string | null
    tipo: 'factura_a' | 'factura_b' | 'factura_c' | 'nota_credito'
    subtotal: number
    iva: number
    total: number
    estado: 'borrador' | 'emitida' | 'anulada'
    fechaEmision: DateTime
    createdAt: DateTime
  }> = {}
): Factura {
  return {
    id: 'factura-1',
    numero: 'F-2026-0001',
    clienteId: 'cliente-1',
    ordenTrabajoId: 'ot-1',
    facturaReferenciaId: null,
    tipo: 'factura_b',
    subtotal: 1000,
    iva: 210,
    total: 1210,
    estado: 'emitida',
    fechaEmision: DateTime.fromISO('2026-07-01T12:00:00.000Z'),
    createdAt: DateTime.fromISO('2026-07-01T12:00:00.000Z'),
    cliente: { razonSocial: 'Cliente Test' },
    items: [],
    ...overrides,
  } as Factura
}

function createCobroMock(): CajaMovimiento {
  return {
    id: 'cobro-1',
    createdAt: DateTime.fromISO('2026-07-02T10:00:00.000Z'),
  } as CajaMovimiento
}

test.group('Factura OT integridad', () => {
  test('bloquea nueva factura cuando la OT ya tiene factura emitida', ({ assert }) => {
    const facturaActiva = { estado: 'emitida' }
    assert.isFalse(puedeGenerarFacturaEnOT(facturaActiva))
  })

  test('bloquea nueva factura cuando la OT ya tiene factura en borrador', ({ assert }) => {
    const facturaActiva = { estado: 'borrador' }
    assert.isFalse(puedeGenerarFacturaEnOT(facturaActiva))
  })

  test('permite re-facturar OT cuando la factura previa está anulada', ({ assert }) => {
    const facturaAnulada = { estado: 'anulada' }
    assert.isTrue(puedeGenerarFacturaEnOT(facturaAnulada))
    assert.isTrue(puedeGenerarFacturaEnOT(null))
  })

  test('permite nota de crédito solo desde factura emitida sin NC previa', ({ assert }) => {
    assert.isTrue(
      puedeEmitirNotaCredito({
        estado: 'emitida',
        tipo: 'factura_b',
        notaCreditoExistente: false,
      })
    )

    assert.isFalse(
      puedeEmitirNotaCredito({
        estado: 'borrador',
        tipo: 'factura_b',
        notaCreditoExistente: false,
      })
    )

    assert.isFalse(
      puedeEmitirNotaCredito({
        estado: 'emitida',
        tipo: 'nota_credito',
        notaCreditoExistente: false,
      })
    )

    assert.isFalse(
      puedeEmitirNotaCredito({
        estado: 'emitida',
        tipo: 'factura_b',
        notaCreditoExistente: true,
      })
    )
  })

  test('serializeFactura marca cobrada cuando existe movimiento de caja', ({ assert }) => {
    const factura = createFacturaMock()
    const cobro = createCobroMock()

    const serialized = serializeFactura(factura, { cobro })

    assert.isTrue(serialized.cobrada)
    assert.equal(serialized.cobroFecha, cobro.createdAt.toISO())
  })

  test('serializeFactura expone puedeEmitirNotaCredito y notaCreditoId', ({ assert }) => {
    const factura = createFacturaMock({ estado: 'emitida', tipo: 'factura_b' })
    const notaCredito = createFacturaMock({
      id: 'nc-1',
      numero: 'NC-2026-0001',
      tipo: 'nota_credito',
      facturaReferenciaId: factura.id,
    })

    const sinNc = serializeFactura(factura, { cobro: null, notaCredito: null })
    assert.isTrue(sinNc.puedeEmitirNotaCredito)
    assert.isUndefined(sinNc.notaCreditoId)

    const conNc = serializeFactura(factura, { cobro: null, notaCredito })
    assert.isFalse(conNc.puedeEmitirNotaCredito)
    assert.equal(conNc.notaCreditoId, 'nc-1')
  })

  test('permite cobros parciales hasta cubrir el total de la factura', ({ assert }) => {
    const totalFactura = 1210
    let totalCobrado = 0

    const registrarCobro = (monto: number) => {
      validarMontoCobro(totalFactura, totalCobrado, monto)
      totalCobrado += monto
    }

    registrarCobro(500)
    assert.equal(totalCobrado, 500)

    registrarCobro(710)
    assert.equal(totalCobrado, 1210)

    assert.throws(() => registrarCobro(1), 'COBRO_EXCEDE_TOTAL')
  })

  test('serializeFactura marca cobro parcial con múltiples movimientos', ({ assert }) => {
    const factura = createFacturaMock()
    const cobro1 = { ...createCobroMock(), monto: 500, concepto: 'Seña', createdAt: DateTime.fromISO('2026-07-02T10:00:00.000Z') }
    const cobro2 = {
      ...createCobroMock(),
      id: 'cobro-2',
      monto: 710,
      concepto: 'Saldo',
      createdAt: DateTime.fromISO('2026-07-03T10:00:00.000Z'),
    }

    const serialized = serializeFactura(factura, { cobros: [cobro1, cobro2] as never })

    assert.equal(serialized.estadoCobro, 'cobrada')
    assert.isTrue(serialized.cobrada)
    assert.equal(serialized.totalCobrado, 1210)
    assert.equal(serialized.saldoPendiente, 0)
  })
})
