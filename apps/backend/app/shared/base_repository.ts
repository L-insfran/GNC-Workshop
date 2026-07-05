import { DateTime } from 'luxon'
import type { IPaginationMeta, IPaginationParams } from '@gnc/shared-types'
import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

type SoftDeletableRow = LucidRow & {
  id: string
  deletedAt?: DateTime | null
}

export abstract class BaseRepository<T extends SoftDeletableRow> {
  protected abstract model: LucidModel

  async findById(id: string): Promise<T | null> {
    const record = await this.model.query().where('id', id).whereNull('deleted_at').first()
    return (record as T | null) ?? null
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
    const record = await this.model.create(data as Partial<LucidRow>)
    return record as T
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const record = await this.findById(id)
    if (!record) return null
    record.merge(data as Partial<LucidRow>)
    await record.save()
    return record
  }

  async softDelete(id: string): Promise<boolean> {
    const record = await this.findById(id)
    if (!record) return false
    record.merge({ deletedAt: DateTime.now() } as Partial<LucidRow>)
    await record.save()
    return true
  }

  protected abstract applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow>
}
