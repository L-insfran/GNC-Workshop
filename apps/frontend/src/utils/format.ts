import type { OrdenEstado, OrdenPrioridad, ClienteTipo, CondicionIva, DocumentoTipo } from '@gnc/shared-types'

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return dateFormatter.format(date)
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return dateTimeFormatter.format(date)
}

export function formatPatente(patente: string): string {
  return patente.toUpperCase()
}

export function formatVehiculoMarcaModelo(vehiculo: {
  marcaNombre?: string | null
  modeloNombre?: string | null
  marca?: { nombre: string } | null
  modelo?: { nombre: string } | null
}): string {
  const marca = vehiculo.marcaNombre ?? vehiculo.marca?.nombre
  const modelo = vehiculo.modeloNombre ?? vehiculo.modelo?.nombre

  if (!marca && !modelo) return '-'
  return [marca, modelo].filter(Boolean).join(' ')
}

export const CLIENTE_TIPO_LABELS: Record<ClienteTipo, string> = {
  persona_fisica: 'Persona física',
  persona_juridica: 'Persona jurídica',
}

export const DOCUMENTO_TIPO_LABELS: Record<DocumentoTipo, string> = {
  dni: 'DNI',
  cuit: 'CUIT',
  cuil: 'CUIL',
}

export const CONDICION_IVA_LABELS: Record<CondicionIva, string> = {
  responsable_inscripto: 'Responsable inscripto',
  monotributo: 'Monotributo',
  consumidor_final: 'Consumidor final',
  exento: 'Exento',
}

export const ORDEN_ESTADO_LABELS: Record<OrdenEstado, string> = {
  borrador: 'Borrador',
  recepcion: 'Recepción',
  en_taller: 'En taller',
  en_espera_repuesto: 'Espera repuesto',
  control_calidad: 'Control calidad',
  finalizada: 'Finalizada',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
}

export const ORDEN_PRIORIDAD_LABELS: Record<OrdenPrioridad, string> = {
  baja: 'Baja',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente',
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
