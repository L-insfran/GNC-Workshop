import { ROLES, type RoleName } from '@gnc/shared-types'

export { ROLES, type RoleName }

export const ROLE_LABELS: Record<RoleName, string> = {
  [ROLES.ADMINISTRADOR]: 'Administrador',
  [ROLES.SUPERVISOR]: 'Supervisor',
  [ROLES.RECEPCION]: 'Recepción',
  [ROLES.MECANICO]: 'Mecánico',
  [ROLES.CAJA]: 'Caja',
  [ROLES.DEPOSITO]: 'Depósito',
  [ROLES.INVITADO]: 'Invitado',
}

export const MODULE_ROLES: Record<string, RoleName[]> = {
  dashboard: [
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.RECEPCION,
    ROLES.MECANICO,
    ROLES.CAJA,
    ROLES.DEPOSITO,
    ROLES.INVITADO,
  ],
  clientes: [
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.RECEPCION,
    ROLES.CAJA,
  ],
  vehiculos: [
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.RECEPCION,
    ROLES.MECANICO,
  ],
  equiposGnc: [
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.RECEPCION,
    ROLES.MECANICO,
  ],
  ordenesTrabajo: [
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.RECEPCION,
    ROLES.MECANICO,
  ],
  inventario: [
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.DEPOSITO,
  ],
  caja: [
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.CAJA,
  ],
  facturacion: [
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.CAJA,
  ],
  agenda: [
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.RECEPCION,
  ],
}

export function hasRole(userRole: RoleName, allowedRoles: RoleName[]): boolean {
  return allowedRoles.includes(userRole)
}
