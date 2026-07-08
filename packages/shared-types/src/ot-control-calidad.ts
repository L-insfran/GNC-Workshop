export interface IOtControlCalidad {
  id: string
  ordenTrabajoId: string
  sinFugas: boolean
  presionReguladorOk: boolean
  valvulasSeguridadOk: boolean
  estanqueidadOk: boolean
  documentacionCompleta: boolean
  observaciones?: string | null
  aprobadoPorId?: string | null
  aprobadoPorNombre?: string | null
  aprobadoAt?: string | null
  completo: boolean
  createdAt: string
  updatedAt: string
}

export interface UpsertOtControlCalidadDTO {
  sinFugas: boolean
  presionReguladorOk: boolean
  valvulasSeguridadOk: boolean
  estanqueidadOk: boolean
  documentacionCompleta: boolean
  observaciones?: string
}

export const OT_CONTROL_CALIDAD_CHECKS = [
  { key: 'sinFugas', label: 'Sin fugas detectadas' },
  { key: 'presionReguladorOk', label: 'Presión de regulador dentro de rango' },
  { key: 'valvulasSeguridadOk', label: 'Válvulas de seguridad operativas' },
  { key: 'estanqueidadOk', label: 'Prueba de estanqueidad aprobada' },
  { key: 'documentacionCompleta', label: 'Documentación y etiquetas en orden' },
] as const

export type OtControlCalidadCheckKey = (typeof OT_CONTROL_CALIDAD_CHECKS)[number]['key']

export function isControlCalidadCompleto(data: Pick<
  IOtControlCalidad,
  | 'sinFugas'
  | 'presionReguladorOk'
  | 'valvulasSeguridadOk'
  | 'estanqueidadOk'
  | 'documentacionCompleta'
>): boolean {
  return (
    data.sinFugas &&
    data.presionReguladorOk &&
    data.valvulasSeguridadOk &&
    data.estanqueidadOk &&
    data.documentacionCompleta
  )
}
