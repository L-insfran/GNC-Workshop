import { DateTime } from 'luxon'
import type { IOrdenTrabajoListParams } from '@gnc/shared-types'
import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import OrdenTrabajo from '#models/orden_trabajo'
import { BaseRepository } from '#shared/base_repository'

export default class OrdenTrabajoRepository extends BaseRepository<OrdenTrabajo> {
  protected model = OrdenTrabajo

  protected applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow> {
    return query.whereILike('numero', `%${search}%`)
  }

  async findByIdWithRelations(id: string): Promise<OrdenTrabajo | null> {
    return OrdenTrabajo.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('cliente')
      .preload('vehiculo', (query) => query.preload('marca').preload('modelo'))
      .preload('equipoGnc')
      .preload('tipoTrabajo')
      .preload('mecanico')
      .preload('recepcionista')
      .first()
  }

  private applyListFilters(
    query: ReturnType<typeof OrdenTrabajo.query>,
    params: IOrdenTrabajoListParams
  ) {
    if (params.filtro === 'activas') {
      query.whereNotIn('estado', ['entregada', 'cancelada'])
    }

    if (params.filtro === 'hoy') {
      const hoy = DateTime.now().startOf('day')
      const finHoy = hoy.endOf('day')
      query
        .where('fecha_ingreso', '>=', hoy.toSQL()!)
        .where('fecha_ingreso', '<=', finHoy.toSQL()!)
    }

    if (params.filtro === 'espera_repuesto') {
      query.where('estado', 'en_espera_repuesto')
    }

    if (params.filtro === 'entregadas_mes') {
      const inicioMes = DateTime.now().startOf('month')
      query
        .where('estado', 'entregada')
        .where('fecha_entrega_real', '>=', inicioMes.toSQL()!)
    }

    if (params.vehiculoId) {
      query.where('vehiculo_id', params.vehiculoId)
    }

    if (params.equipoGncId) {
      query.where('equipo_gnc_id', params.equipoGncId)
    }

    if (params.clienteId) {
      query.where('cliente_id', params.clienteId)
    }

    return query
  }

  async findAllWithRelations(params: IOrdenTrabajoListParams = {}) {
    const page = params.page ?? 1
    const perPage = Math.min(params.perPage ?? 20, 100)

    let query = OrdenTrabajo.query().whereNull('deleted_at')
    query = this.applyListFilters(query, params)

    if (params.search) {
      query = this.applySearch(query, params.search)
    }

    if (params.sortBy) {
      query = query.orderBy(params.sortBy, params.sortOrder ?? 'asc')
    } else {
      query = query.orderBy('created_at', 'desc')
    }

    const result = await query.paginate(page, perPage)

    const data = result.all() as OrdenTrabajo[]
    await Promise.all(
      data.map(async (orden) => {
        await orden.load('cliente')
        await orden.load('vehiculo', (vehiculoQuery) =>
          vehiculoQuery.preload('marca').preload('modelo')
        )
        await orden.load('equipoGnc')
        await orden.load('tipoTrabajo')
        await orden.load('mecanico')
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

  async generateNumero(): Promise<string> {
    const year = DateTime.now().year
    const prefix = `OT-${year}-`

    const lastOrden = await OrdenTrabajo.query()
      .where('numero', 'like', `${prefix}%`)
      .orderBy('numero', 'desc')
      .first()

    let nextSequence = 1
    if (lastOrden) {
      const lastSequence = Number.parseInt(lastOrden.numero.split('-')[2] ?? '0', 10)
      nextSequence = lastSequence + 1
    }

    return `${prefix}${String(nextSequence).padStart(5, '0')}`
  }
}
