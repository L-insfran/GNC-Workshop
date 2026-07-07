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
  configuracion: [ROLES.ADMINISTRADOR],
  configuracionAll: [
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.DEPOSITO,
  ],
  configuracionCatalogos: [
    ROLES.ADMINISTRADOR,
    ROLES.SUPERVISOR,
    ROLES.DEPOSITO,
  ],
  configuracionMarcas: [ROLES.ADMINISTRADOR, ROLES.SUPERVISOR],
  /** Margen bruto y costos de repuestos (dato sensible) */
  margenOt: [ROLES.ADMINISTRADOR, ROLES.SUPERVISOR],
}

export function hasRole(
  userRole: RoleName,
  allowedRoles: RoleName[],
  userRoles?: RoleName[],
): boolean {
  const rolesToCheck = userRoles?.length ? userRoles : [userRole]
  return rolesToCheck.some((role) => allowedRoles.includes(role))
}

export function getUserRoleNames(user: {
  role: RoleName
  roles?: { name: RoleName }[]
}): RoleName[] {
  const fromRoles = user.roles?.map((r) => r.name) ?? []
  if (fromRoles.length > 0) return fromRoles
  return [user.role]
}
