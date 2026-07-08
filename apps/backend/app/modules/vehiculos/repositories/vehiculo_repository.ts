import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Vehiculo from '#models/vehiculo'
import { BaseRepository } from '#shared/base_repository'

export default class VehiculoRepository extends BaseRepository<Vehiculo> {
  protected model = Vehiculo

  protected applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow> {
    return query.whereILike('patente', `%${search}%`)
  }

  async findByIdWithRelations(id: string): Promise<Vehiculo | null> {
    return Vehiculo.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('marca')
      .preload('modelo')
      .preload('cliente')
      .first()
  }

import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { IPaginationParams } from '@gnc/shared-types'
import Vehiculo from '#models/vehiculo'
import { BaseRepository } from '#shared/base_repository'

type VehiculoListParams = IPaginationParams & { clienteId?: string }

export default class VehiculoRepository extends BaseRepository<Vehiculo> {
  protected model = Vehiculo

  protected applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow> {
    return query.whereILike('patente', `%${search}%`)
  }

  async findAllWithRelations(params: VehiculoListParams = {}) {
    const page = params.page ?? 1
    const perPage = Math.min(params.perPage ?? 20, 100)

    let query = Vehiculo.query().whereNull('deleted_at')

    if (params.clienteId) {
      query = query.where('cliente_id', params.clienteId)
    }

    if (params.search) {
      query = this.applySearch(query, params.search)
    }

    if (params.sortBy) {
      query = query.orderBy(params.sortBy, params.sortOrder ?? 'asc')
    } else {
      query = query.orderBy('created_at', 'desc')
    }

    const result = await query.paginate(page, perPage)
    const data = result.all() as Vehiculo[]

    await Promise.all(
      data.map(async (vehiculo) => {
        await vehiculo.load('marca')
        await vehiculo.load('modelo')
      })
    )

    return {
      data,
      meta: {
        page: result.currentPage,
        perPage: result.perPage,
        total: result.total,
        lastPage: result.lastPage,
      },
    }
  }

  async findByPatente(patente: string): Promise<Vehiculo | null> {
    return Vehiculo.query()
      .where('patente', patente.toUpperCase())
      .whereNull('deleted_at')
      .first()
  }
}
