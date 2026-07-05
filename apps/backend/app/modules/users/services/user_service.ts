import type { IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import { BaseService } from '#shared/base_service'
import UserRepository from '#modules/users/repositories/user_repository'

export default class UserService extends BaseService<User> {
  protected entityType = 'user'
  protected repository = new UserRepository()

  async list(params?: IPaginationParams) {
    return this.repository.findAllWithRoles(params)
  }

  async getById(id: string): Promise<User | null> {
    return this.repository.findByIdWithRoles(id)
  }

  async create(
    data: {
      email: string
      password: string
      fullName: string
      phone?: string
      roleIds: string[]
      isActive?: boolean
    },
    user: User
  ): Promise<User> {
    // Password en texto plano: withAuthFinder hashea al guardar (no usar hash.make).
    const record = await this.repository.create({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone ?? null,
      isActive: data.isActive ?? true,
    })

    await this.repository.attachRoles(record, data.roleIds)
    await record.load('roles')

    await this.emitCreated(user, record)
    return record
  }

  async update(
    id: string,
    data: {
      email?: string
      password?: string
      fullName?: string
      phone?: string | null
      roleIds?: string[]
      isActive?: boolean
    },
    user: User
  ): Promise<User | null> {
    const existing = await this.repository.findByIdWithRoles(id)
    if (!existing) return null

    const updateData: Partial<User> = {}
    if (data.email !== undefined) updateData.email = data.email
    if (data.fullName !== undefined) updateData.fullName = data.fullName
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.password) updateData.password = data.password

    const updated = await this.repository.update(id, updateData)
    if (!updated) return null

    if (data.roleIds) {
      await this.repository.attachRoles(updated, data.roleIds)
    }

    await updated.load('roles')
    await this.emitUpdated(user, existing, updated)
    return updated
  }

  private async emitCreated(actor: User, record: User) {
    const { EntityCreated } = await import('#events/audit_events')
    await EntityCreated.dispatch({
      userId: actor.id,
      entityType: this.entityType,
      entityId: record.id,
      newValues: { email: record.email, fullName: record.fullName },
    })
  }

  private async emitUpdated(actor: User, existing: User, updated: User) {
    const { EntityUpdated } = await import('#events/audit_events')
    await EntityUpdated.dispatch({
      userId: actor.id,
      entityType: this.entityType,
      entityId: updated.id,
      oldValues: { email: existing.email, fullName: existing.fullName },
      newValues: { email: updated.email, fullName: updated.fullName },
    })
  }
}
