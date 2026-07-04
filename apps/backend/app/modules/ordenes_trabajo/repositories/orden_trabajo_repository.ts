import { DateTime } from 'luxon'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import OrdenTrabajo from '#models/orden_trabajo'
import { BaseRepository } from '#shared/base_repository'

export default class OrdenTrabajoRepository extends BaseRepository<OrdenTrabajo> {
  protected model = OrdenTrabajo

  protected applySearch(
    query: ModelQueryBuilderContract<OrdenTrabajo>,
    search: string
  ): ModelQueryBuilderContract<OrdenTrabajo> {
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

  async findAllWithRelations(params = {}) {
    const result = await this.findAll(params)
    await Promise.all(
      result.data.map(async (orden) => {
        await orden.load('cliente')
        await orden.load('vehiculo')
        await orden.load('tipoTrabajo')
      })
    )
    return result
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
