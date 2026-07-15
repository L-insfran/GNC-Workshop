import { test } from '@japa/runner'
import {
  buildMailtoUrl,
  buildWhatsappUrl,
  normalizePhoneE164,
} from '../../app/integrations/notificaciones/utils/phone_utils.ts'

test.group('Notificaciones phone utils', () => {
  test('normaliza móvil AR con 0 y 15', ({ assert }) => {
    assert.equal(normalizePhoneE164('011 15-1234-5678'), '5491112345678')
  })

  test('acepta E.164 con +54 9', ({ assert }) => {
    assert.equal(normalizePhoneE164('+54 9 11 2345-6789'), '5491123456789')
  })

  test('retorna null si vacío', ({ assert }) => {
    assert.isNull(normalizePhoneE164(null))
    assert.isNull(normalizePhoneE164('  '))
  })

  test('arma wa.me con mensaje', ({ assert }) => {
    const url = buildWhatsappUrl('5491112345678', 'Hola mundo')
    assert.equal(url, 'https://wa.me/5491112345678?text=Hola%20mundo')
  })

  test('arma mailto', ({ assert }) => {
    const url = buildMailtoUrl('a@b.com', 'Asunto', 'Cuerpo')
    assert.include(url, 'mailto:a@b.com?subject=')
    assert.include(url, 'body=')
  })
})
