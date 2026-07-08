import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { validarEquipoParaNuevaOt } from '#shared/equipo_gnc_validacion_util'
import type EquipoGnc from '#models/equipo_gnc'
import type Cilindro from '#models/cilindro'

function mockEquipo(fechaVencimientoOblea: string): EquipoGnc {
  return {
    fechaVencimientoOblea: DateTime.fromISO(fechaVencimientoOblea, { zone: 'utc' }),
  } as EquipoGnc
}

function mockCilindro(fechaVencimientoPh: string, estado: Cilindro['estado'] = 'activo'): Cilindro {
  return {
    fechaVencimientoPh: DateTime.fromISO(fechaVencimientoPh, { zone: 'utc' }),
    estado,
  } as Cilindro
}

test.group('validarEquipoParaNuevaOt', () => {
  test('bloquea oblea vencida en revision anual', ({ assert }) => {
    assert.throws(
      () =>
        validarEquipoParaNuevaOt(
          mockEquipo('2020-01-01'),
          [mockCilindro('2030-01-01')],
          'Revisión anual'
        ),
      /OBLEA_VENCIDA/
    )
  })

  test('permite oblea vencida en renovacion de oblea', ({ assert }) => {
    assert.doesNotThrow(() =>
      validarEquipoParaNuevaOt(
        mockEquipo('2020-01-01'),
        [mockCilindro('2030-01-01')],
        'Renovación de oblea'
      )
    )
  })

  test('bloquea ph vencida en revision anual', ({ assert }) => {
    assert.throws(
      () =>
        validarEquipoParaNuevaOt(
          mockEquipo('2030-01-01'),
          [mockCilindro('2020-01-01')],
          'Revisión anual'
        ),
      /PH_VENCIDA/
    )
  })

  test('permite ph vencida en prueba hidraulica', ({ assert }) => {
    assert.doesNotThrow(() =>
      validarEquipoParaNuevaOt(
        mockEquipo('2030-01-01'),
        [mockCilindro('2020-01-01')],
        'Prueba hidráulica'
      )
    )
  })
})
