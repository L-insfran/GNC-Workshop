export interface CreateTipoTrabajoDTO {
  nombre: string
  descripcion?: string
  duracionEstimadaHoras?: number
}

export interface UpdateTipoTrabajoDTO {
  nombre?: string
  descripcion?: string | null
  duracionEstimadaHoras?: number | null
  isActive?: boolean
}

function normalizeNombre(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function esRenovacionOblea(nombre: string): boolean {
  const n = normalizeNombre(nombre)
  return n.includes('renovacion de oblea')
}

export function esPruebaHidraulica(nombre: string): boolean {
  const n = normalizeNombre(nombre)
  return n.includes('prueba hidraulica')
}

export function esReparacionCilindro(nombre: string): boolean {
  const n = normalizeNombre(nombre)
  return n.includes('reparacion') && n.includes('cilindro')
}

/** Tipos que pueden abrirse con oblea vencida. */
export function permiteObleaVencida(nombre: string): boolean {
  return esRenovacionOblea(nombre)
}

/** Tipos que pueden abrirse con PH de cilindro vencida. */
export function permitePhVencida(nombre: string): boolean {
  return esPruebaHidraulica(nombre) || esReparacionCilindro(nombre)
}
