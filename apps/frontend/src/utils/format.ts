import type {
  OrdenEstado,
  OrdenPrioridad,
  OrdenResumenCobroEstado,
  ClienteTipo,
  CondicionIva,
  DocumentoTipo,
} from '@gnc/shared-types'

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

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${value.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

export function getMargenBadgeVariant(
  margenPorcentaje: number | null,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (margenPorcentaje === null) return 'neutral'
  if (margenPorcentaje >= 40) return 'success'
  if (margenPorcentaje >= 20) return 'warning'
  return 'danger'
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return dateFormatter.format(date)
}

/** Formatea fechas calendario (sin hora) sin desplazamiento por zona horaria. */
export function formatDateOnly(value: string): string {
  const datePart = value.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

export function toDateInputValue(value?: string | null): string {
  if (!value) return ''
  return value.split('T')[0]
}

export function todayDateInputValue(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function calcularFechaEstimadaDefault(duracionHoras?: number | null): string {
  const today = new Date()
  const diasEstimados = Math.max(1, Math.ceil((duracionHoras ?? 8) / 8))
  today.setDate(today.getDate() + diasEstimados - 1)

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

export const ORDEN_COBRO_LABELS: Record<OrdenResumenCobroEstado, string> = {
  no_aplica: '—',
  sin_factura: 'Sin factura',
  borrador: 'Borrador',
  pendiente: 'Pendiente',
  parcial: 'Cobro parcial',
  cobrada: 'Cobrada',
  anulada: 'Anulada',
}

export function getOrdenCobroBadgeVariant(
  estado: OrdenResumenCobroEstado,
): 'success' | 'warning' | 'danger' | 'neutral' | 'info' {
  switch (estado) {
    case 'cobrada':
      return 'success'
    case 'parcial':
    case 'pendiente':
    case 'borrador':
      return 'warning'
    case 'anulada':
      return 'danger'
    case 'sin_factura':
      return 'info'
    default:
      return 'neutral'
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
