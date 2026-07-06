import type { IRole } from './roles'

export interface IUser {
  id: string
  email: string
  fullName: string
  phone?: string | null
  avatarUrl?: string | null
  isActive: boolean
  roles: IRole[]
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserDTO {
  email: string
  password: string
  fullName: string
  phone?: string
  roleIds: string[]
  isActive?: boolean
}

export interface UpdateUserDTO {
  email?: string
  password?: string
  fullName?: string
  phone?: string | null
  roleIds?: string[]
  isActive?: boolean
}
