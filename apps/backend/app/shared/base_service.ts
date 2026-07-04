import type { IPaginationParams } from '@gnc/shared-types'
import emitter from '@adonisjs/core/services/emitter'
import type User from '#models/user'
import { EntityCreated, EntityDeleted, EntityUpdated } from '#events/audit_events'

export abstract class BaseService<T extends { id: string }> {
  protected abstract entityType: string

  protected abstract repository: {
    findById(id: string): Promise<T | null>
    findAll(params?: IPaginationParams): Promise<{ data: T[]; meta: unknown }>
    create(data: Partial<T>): Promise<T>
    update(id: string, data: Partial<T>): Promise<T | null>
    softDelete(id: string): Promise<boolean>
  }

  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id)
  }

  async list(params?: IPaginationParams) {
    return this.repository.findAll(params)
  }

  async create(data: Partial<T>, user: User): Promise<T> {
    const record = await this.repository.create(data)
    await emitter.emit(EntityCreated, {
      userId: user.id,
      entityType: this.entityType,
      entityId: record.id,
      newValues: record as unknown as Record<string, unknown>,
    })
    return record
  }

  async update(id: string, data: Partial<T>, user: User): Promise<T | null> {
    const existing = await this.repository.findById(id)
    if (!existing) return null
    const updated = await this.repository.update(id, data)
    if (updated) {
      await emitter.emit(EntityUpdated, {
        userId: user.id,
        entityType: this.entityType,
        entityId: id,
        oldValues: existing as unknown as Record<string, unknown>,
        newValues: updated as unknown as Record<string, unknown>,
      })
    }
    return updated
  }

  async delete(id: string, user: User): Promise<boolean> {
    const existing = await this.repository.findById(id)
    if (!existing) return false
    const deleted = await this.repository.softDelete(id)
    if (deleted) {
      await emitter.emit(EntityDeleted, {
        userId: user.id,
        entityType: this.entityType,
        entityId: id,
        oldValues: existing as unknown as Record<string, unknown>,
      })
    }
    return deleted
  }
}
