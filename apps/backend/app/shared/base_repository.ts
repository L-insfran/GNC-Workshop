import type { IPaginationMeta, IPaginationParams } from '@gnc/shared-types'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export abstract class BaseRepository<T extends { deletedAt?: Date | null }> {
  protected abstract model: { query: () => ModelQueryBuilderContract<T> }

  async findById(id: string): Promise<T | null> {
    return this.model.query().where('id', id).whereNull('deleted_at').first()
  }

  async findAll(params: IPaginationParams = {}) {
    const page = params.page ?? 1
    const perPage = Math.min(params.perPage ?? 20, 100)

    let query = this.model.query().whereNull('deleted_at')

    if (params.search) {
      query = this.applySearch(query, params.search)
    }

    if (params.sortBy) {
      query = query.orderBy(params.sortBy, params.sortOrder ?? 'asc')
    } else {
      query = query.orderBy('created_at', 'desc')
    }

    const result = await query.paginate(page, perPage)

    const meta: IPaginationMeta = {
      page: result.currentPage,
      perPage: result.perPage,
      total: result.total,
      lastPage: result.lastPage,
    }

    return { data: result.all() as T[], meta }
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.query().create(data) as Promise<T>
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const record = await this.findById(id)
    if (!record) return null
    ;(record as T & { merge: (d: Partial<T>) => void; save: () => Promise<void> }).merge(data)
    await (record as T & { save: () => Promise<void> }).save()
    return record
  }

  async softDelete(id: string): Promise<boolean> {
    const record = await this.findById(id)
    if (!record) return false
    ;(record as T & { merge: (d: { deletedAt: Date }) => void; save: () => Promise<void> }).merge({
      deletedAt: new Date(),
    })
    await (record as T & { save: () => Promise<void> }).save()
    return true
  }

  protected abstract applySearch(
    query: ModelQueryBuilderContract<T>,
    search: string
  ): ModelQueryBuilderContract<T>
}
