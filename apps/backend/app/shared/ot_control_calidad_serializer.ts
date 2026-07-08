import type OtControlCalidad from '#models/ot_control_calidad'
import type { IOtControlCalidad } from '@gnc/shared-types'

export function serializeOtControlCalidad(registro: OtControlCalidad): IOtControlCalidad {
  return {
    id: registro.id,
    ordenTrabajoId: registro.ordenTrabajoId,
    sinFugas: registro.sinFugas,
    presionReguladorOk: registro.presionReguladorOk,
    valvulasSeguridadOk: registro.valvulasSeguridadOk,
    estanqueidadOk: registro.estanqueidadOk,
    documentacionCompleta: registro.documentacionCompleta,
    observaciones: registro.observaciones,
    aprobadoPorId: registro.aprobadoPorId,
    aprobadoPorNombre: registro.aprobadoPor?.fullName ?? null,
    aprobadoAt: registro.aprobadoAt?.toISO() ?? null,
    completo: registro.completo,
    createdAt: registro.createdAt.toISO()!,
    updatedAt: registro.updatedAt.toISO()!,
  }
}
