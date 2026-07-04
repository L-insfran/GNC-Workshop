export const ROLES = {
  ADMINISTRADOR: 'administrador',
  SUPERVISOR: 'supervisor',
  RECEPCION: 'recepcion',
  MECANICO: 'mecanico',
  CAJA: 'caja',
  DEPOSITO: 'deposito',
  INVITADO: 'invitado',
} as const

export type RoleName = (typeof ROLES)[keyof typeof ROLES]

export interface IRole {
  id: string
  name: RoleName
  displayName: string
  description?: string
}
