import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import {
  esPruebaHidraulica,
  esRenovacionOblea,
  esReparacionCilindro,
  permiteObleaVencida,
  permitePhVencida,
} from '@gnc/shared-types'

test.group('tipos-trabajo util', () => {
  test('detecta renovacion de oblea', ({ assert }) => {
    assert.isTrue(esRenovacionOblea('Renovación de oblea'))
    assert.isFalse(esRenovacionOblea('Revisión anual'))
  })

  test('detecta prueba hidraulica', ({ assert }) => {
    assert.isTrue(esPruebaHidraulica('Prueba hidráulica'))
    assert.isFalse(esPruebaHidraulica('Instalación nueva'))
  })

  test('detecta reparacion de cilindro', ({ assert }) => {
    assert.isTrue(esReparacionCilindro('Reparación / cambio de cilindro'))
    assert.isFalse(esReparacionCilindro('Conversión de regulador'))
  })

  test('permite oblea vencida solo en renovacion', ({ assert }) => {
    assert.isTrue(permiteObleaVencida('Renovación de oblea'))
    assert.isFalse(permiteObleaVencida('Revisión anual'))
  })

  test('permite ph vencida en ph y reparacion cilindro', ({ assert }) => {
    assert.isTrue(permitePhVencida('Prueba hidráulica'))
    assert.isTrue(permitePhVencida('Reparación / cambio de cilindro'))
    assert.isFalse(permitePhVencida('Revisión anual'))
  })
})

test.group('equipo regulatory dates', () => {
  test('vencimiento oblea es 1 año desde hoy', ({ assert }) => {
    const hoy = DateTime.fromISO('2026-07-08', { zone: 'utc' }).startOf('day')
    assert.equal(hoy.plus({ years: 1 }).toISODate(), '2027-07-08')
  })

  test('vencimiento ph es 5 años desde hoy', ({ assert }) => {
    const hoy = DateTime.fromISO('2026-07-08', { zone: 'utc' }).startOf('day')
    assert.equal(hoy.plus({ years: 5 }).toISODate(), '2031-07-08')
  })
})
