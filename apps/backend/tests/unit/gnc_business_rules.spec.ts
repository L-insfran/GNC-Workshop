import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('GNC Business Rules', () => {
  test('oblea vencimiento is 1 year after instalacion', ({ assert }) => {
    const fechaInstalacion = DateTime.fromISO('2025-01-15')
    const fechaVencimientoOblea = fechaInstalacion.plus({ years: 1 })
    assert.equal(fechaVencimientoOblea.toISODate(), '2026-01-15')
  })

  test('PH vencimiento is 5 years after ultima PH', ({ assert }) => {
    const fechaUltimaPh = DateTime.fromISO('2021-06-01')
    const fechaVencimientoPh = fechaUltimaPh.plus({ years: 5 })
    assert.equal(fechaVencimientoPh.toISODate(), '2026-06-01')
  })

  test('alerta oblea is 30 days before vencimiento', ({ assert }) => {
    const vencimiento = DateTime.fromISO('2026-03-15')
    const alerta = vencimiento.minus({ days: 30 })
    assert.equal(alerta.toISODate(), '2026-02-13')
  })

  test('alerta PH is 60 days before vencimiento', ({ assert }) => {
    const vencimiento = DateTime.fromISO('2026-08-01')
    const alerta = vencimiento.minus({ days: 60 })
    assert.equal(alerta.toISODate(), '2026-06-02')
  })
})
