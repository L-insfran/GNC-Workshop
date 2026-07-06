import { DateTime } from 'luxon'

/**
 * Parsea fechas calendario (YYYY-MM-DD) sin desplazamiento por zona horaria.
 */
export function parseDateOnly(value: string, fieldName = 'fecha'): DateTime {
  const date = DateTime.fromISO(value, { zone: 'utc' }).startOf('day')
  if (!date.isValid) {
    throw new Error(`FECHA_INVALIDA:${fieldName}`)
  }
  return date
}

export function dateOnlyToIso(date: DateTime): string {
  return date.toISODate()!
}
