import { test } from '@japa/runner'
import { isControlCalidadCompleto } from '@gnc/shared-types'

test.group('isControlCalidadCompleto', () => {
  test('requiere todos los checks en true', ({ assert }) => {
    assert.isFalse(
      isControlCalidadCompleto({
        sinFugas: true,
        presionReguladorOk: true,
        valvulasSeguridadOk: false,
        estanqueidadOk: true,
        documentacionCompleta: true,
      })
    )

    assert.isTrue(
      isControlCalidadCompleto({
        sinFugas: true,
        presionReguladorOk: true,
        valvulasSeguridadOk: true,
        estanqueidadOk: true,
        documentacionCompleta: true,
      })
    )
  })
})
