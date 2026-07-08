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

export type OtControlCalidadCheckKey =
  | 'sinFugas'
  | 'presionReguladorOk'
  | 'valvulasSeguridadOk'
  | 'estanqueidadOk'
  | 'documentacionCompleta'

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
