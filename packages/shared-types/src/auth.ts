import type { IRole, RoleName } from './roles'

export interface ILoginDTO {
  email: string
  password: string
}

export interface IAuthUser {
  id: string
  email: string
  fullName: string
  role: RoleName
  roles: IRole[]
  avatarUrl?: string
}

export interface IAuthResponse {
  token: string
  user: IAuthUser
}
