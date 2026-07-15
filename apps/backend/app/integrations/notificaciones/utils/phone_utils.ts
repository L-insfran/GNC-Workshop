/**
 * Normaliza teléfonos AR a dígitos internacionales sin "+" (wa.me / WhatsApp Cloud).
 * Preferí guardar en cliente el formato +54 9 11...; esta función tolera variantes locales.
 */
export function normalizePhoneE164(
  telefono: string | null | undefined,
  defaultCountryCode = '54'
): string | null {
  if (!telefoneOrEmpty(telefono)) return null

  let digits = telefono!.replace(/\D/g, '')
  if (!digits) return null

  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)

  // Formato viejo: 11 15 XXXXXXXX → 11XXXXXXXX
  const legacy15 = digits.match(/^(\d{2,4})15(\d{6,8})$/)
  if (legacy15) {
    digits = `${legacy15[1]}${legacy15[2]}`
  }

  if (!digits.startsWith(defaultCountryCode)) {
    // WhatsApp AR suele requerir 9 tras el código de país
    if (digits.length >= 10 && digits.length <= 11 && !digits.startsWith('9')) {
      digits = `9${digits}`
    }
    digits = `${defaultCountryCode}${digits}`
  }

  if (digits.length < 11 || digits.length > 15) return null
  return digits
}

function telefoneOrEmpty(value: string | null | undefined): value is string {
  return Boolean(value?.trim())
}

export function buildWhatsappUrl(telefonoE164: string, mensaje: string): string {
  const text = encodeURIComponent(mensaje)
  return `https://wa.me/${telefonoE164}?text=${text}`
}

export function buildMailtoUrl(email: string, asunto: string, mensaje: string): string {
  const subject = encodeURIComponent(asunto)
  const body = encodeURIComponent(mensaje)
  return `mailto:${email}?subject=${subject}&body=${body}`
}
