import { DateTime } from 'luxon'
import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Factura from '#models/factura'
import CajaMovimiento from '#models/caja_movimiento'
import type { IOrdenCobroResumen } from '@gnc/shared-types'
import { BaseRepository } from '#shared/base_repository'
import { calcularEstadoCobro, calcularSaldoPendiente } from '#shared/factura_cobro_util'

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

  async findCobrosByFacturaId(facturaId: string): Promise<CajaMovimiento[]> {
    return CajaMovimiento.query()
      .where('factura_id', facturaId)
      .where('tipo', 'ingreso')
      .orderBy('created_at', 'asc')
  }

  async sumCobradoByFacturaId(facturaId: string): Promise<number> {
    const cobros = await this.findCobrosByFacturaId(facturaId)
    return cobros.reduce((acc, cobro) => acc + Number(cobro.monto), 0)
  }

  async findCobroByFacturaId(facturaId: string): Promise<CajaMovimiento | null> {
    const cobros = await this.findCobrosByFacturaId(facturaId)
    return cobros.length > 0 ? cobros[cobros.length - 1] : null
  }

  async findCobroResumenByOrdenTrabajoIds(
    ordenIds: string[],
    ordenEstados: Map<string, string>
  ): Promise<Map<string, IOrdenCobroResumen>> {
    const resumenes = new Map<string, IOrdenCobroResumen>()

    for (const ordenId of ordenIds) {
      const estadoOt = ordenEstados.get(ordenId)
      if (estadoOt !== 'finalizada' && estadoOt !== 'entregada') {
        resumenes.set(ordenId, { estado: 'no_aplica' })
      }
    }

    const ordenesFacturables = ordenIds.filter((id) => {
      const estado = ordenEstados.get(id)
      return estado === 'finalizada' || estado === 'entregada'
    })

    if (!ordenesFacturables.length) {
      return resumenes
    }

    const facturas = await Factura.query()
      .whereIn('orden_trabajo_id', ordenesFacturables)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')

    const facturaPorOt = new Map<string, Factura>()
    for (const factura of facturas) {
      if (!factura.ordenTrabajoId) continue
      const existente = facturaPorOt.get(factura.ordenTrabajoId)
      if (!existente) {
        facturaPorOt.set(factura.ordenTrabajoId, factura)
        continue
      }
      const existenteActiva = ['borrador', 'emitida'].includes(existente.estado)
      const nuevaActiva = ['borrador', 'emitida'].includes(factura.estado)
      if (nuevaActiva && !existenteActiva) {
        facturaPorOt.set(factura.ordenTrabajoId, factura)
      }
    }

    const facturaIds = [...facturaPorOt.values()].map((f) => f.id)
    const cobrosPorFactura = new Map<string, number>()

    if (facturaIds.length > 0) {
      const cobros = await CajaMovimiento.query()
        .whereIn('factura_id', facturaIds)
        .where('tipo', 'ingreso')

      for (const cobro of cobros) {
        if (!cobro.facturaId) continue
        const actual = cobrosPorFactura.get(cobro.facturaId) ?? 0
        cobrosPorFactura.set(cobro.facturaId, actual + Number(cobro.monto))
      }
    }

    for (const ordenId of ordenesFacturables) {
      const factura = facturaPorOt.get(ordenId)
      if (!factura) {
        resumenes.set(ordenId, { estado: 'sin_factura' })
        continue
      }

      if (factura.estado === 'borrador') {
        resumenes.set(ordenId, {
          estado: 'borrador',
          facturaId: factura.id,
          facturaNumero: factura.numero,
          totalFacturado: Number(factura.total),
          totalCobrado: 0,
          saldoPendiente: Number(factura.total),
        })
        continue
      }

      if (factura.estado === 'anulada') {
        resumenes.set(ordenId, {
          estado: 'anulada',
          facturaId: factura.id,
          facturaNumero: factura.numero,
        })
        continue
      }

      const total = Number(factura.total)
      const totalCobrado = cobrosPorFactura.get(factura.id) ?? 0
      const estadoCobro = calcularEstadoCobro(total, totalCobrado)

      resumenes.set(ordenId, {
        estado: estadoCobro,
        facturaId: factura.id,
        facturaNumero: factura.numero,
        totalFacturado: total,
        totalCobrado: Number(totalCobrado.toFixed(2)),
        saldoPendiente: calcularSaldoPendiente(total, totalCobrado),
      })
    }

    return resumenes
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
