import { DateTime } from 'luxon'
import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Factura from '#models/factura'
import CajaMovimiento from '#models/caja_movimiento'
import { BaseRepository } from '#shared/base_repository'

export default class FacturaRepository extends BaseRepository<Factura> {
  protected model = Factura

  protected applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow> {
    return query.whereILike('numero', `%${search}%`)
  }

  async findByIdWithRelations(id: string): Promise<Factura | null> {
    return Factura.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('cliente')
      .preload('items')
      .first()
  }

  async findAllWithRelations(params = {}) {
    const result = await this.findAll(params)
    await Promise.all(
      result.data.map(async (factura) => {
        await factura.load('cliente')
        await factura.load('items')
      })
    )
    return result
  }

  async findActivaByOrdenTrabajoId(ordenTrabajoId: string): Promise<Factura | null> {
    return Factura.query()
      .where('orden_trabajo_id', ordenTrabajoId)
      .whereNull('deleted_at')
      .whereIn('estado', ['borrador', 'emitida'])
      .orderBy('created_at', 'desc')
      .first()
  }

  async findLatestByOrdenTrabajoId(ordenTrabajoId: string): Promise<Factura | null> {
    return Factura.query()
      .where('orden_trabajo_id', ordenTrabajoId)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .preload('cliente')
      .preload('items')
      .first()
  }

  async findCobroByFacturaId(facturaId: string): Promise<CajaMovimiento | null> {
    return CajaMovimiento.query()
      .where('factura_id', facturaId)
      .where('tipo', 'ingreso')
      .first()
  }

  async findNotaCreditoByFacturaReferenciaId(facturaReferenciaId: string): Promise<Factura | null> {
    return Factura.query()
      .where('factura_referencia_id', facturaReferenciaId)
      .whereNull('deleted_at')
      .where('tipo', 'nota_credito')
      .whereNot('estado', 'anulada')
      .first()
  }

  async generateNumero(): Promise<string> {
    const year = DateTime.now().year
    const prefix = `FC-${year}-`

    const last = await Factura.query()
      .where('numero', 'like', `${prefix}%`)
      .orderBy('numero', 'desc')
      .first()

    let next = 1
    if (last) {
      next = Number.parseInt(last.numero.split('-')[2] ?? '0', 10) + 1
    }

    return `${prefix}${String(next).padStart(5, '0')}`
  }

  async generateNumeroNotaCredito(): Promise<string> {
    const year = DateTime.now().year
    const prefix = `NC-${year}-`

    const last = await Factura.query()
      .where('numero', 'like', `${prefix}%`)
      .orderBy('numero', 'desc')
      .first()

    let next = 1
    if (last) {
      next = Number.parseInt(last.numero.split('-')[2] ?? '0', 10) + 1
    }

    return `${prefix}${String(next).padStart(5, '0')}`
  }
}
