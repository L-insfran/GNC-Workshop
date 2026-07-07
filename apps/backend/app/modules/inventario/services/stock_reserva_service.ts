import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import type { OrdenEstado } from '@gnc/shared-types'
import { OT_ESTADOS_CON_RESERVA_STOCK } from '@gnc/shared-types'
import OtItem from '#models/ot_item'
import Producto from '#models/producto'
import StockReserva from '#models/stock_reserva'
import { getStockDisponibilidad } from '#shared/stock_util'

type Trx = TransactionClientContract

function ordenRequiereReserva(estado: OrdenEstado): boolean {
  return (OT_ESTADOS_CON_RESERVA_STOCK as readonly OrdenEstado[]).includes(estado)
}

export default class StockReservaService {
  async reservarStockPorOt(
    ordenTrabajoId: string,
    userId: string,
    trx?: Trx
  ): Promise<void> {
    const items = await this.getItemsReservables(ordenTrabajoId, trx)

    for (const item of items) {
      await this.upsertReservaActiva(item, userId, trx)
    }
  }

  async liberarReservasPorOt(
    ordenTrabajoId: string,
    motivo: string,
    trx?: Trx
  ): Promise<void> {
    const now = DateTime.now().toSQL()
    const query = trx
      ? trx.from('stock_reservas')
      : db.from('stock_reservas')

    await query
      .where('orden_trabajo_id', ordenTrabajoId)
      .whereNull('released_at')
      .update({
        released_at: now,
        motivo_liberacion: motivo,
      })
  }

  async liberarReservaPorItem(otItemId: string, motivo: string, trx?: Trx): Promise<void> {
    const now = DateTime.now().toSQL()
    const query = trx ? trx.from('stock_reservas') : db.from('stock_reservas')

    await query
      .where('ot_item_id', otItemId)
      .whereNull('released_at')
      .update({
        released_at: now,
        motivo_liberacion: motivo,
      })
  }

  async sincronizarReservaPorItem(
    otItemId: string,
    ordenEstado: OrdenEstado,
    userId: string,
    trx?: Trx
  ): Promise<void> {
    if (!ordenRequiereReserva(ordenEstado)) {
      return
    }

    const item = await OtItem.query({ client: trx })
      .where('id', otItemId)
      .whereNull('deleted_at')
      .first()

    if (!item || !item.productoId || (item.tipo !== 'repuesto' && item.tipo !== 'material')) {
      await this.liberarReservaPorItem(otItemId, 'item_sin_producto', trx)
      return
    }

    await this.upsertReservaActiva(item, userId, trx)
  }

  async validarReservaDisponible(
    productoId: string,
    stockActual: number,
    cantidad: number,
    excludeOtItemId?: string
  ): Promise<void> {
    const { stockDisponible } = await getStockDisponibilidad(stockActual, productoId, {
      excludeOtItemId,
    })
    const cantidadRequerida = Math.ceil(Number(cantidad))

    if (stockDisponible < cantidadRequerida) {
      throw new Error('STOCK_INSUFICIENTE_RESERVA')
    }
  }

  private async getItemsReservables(ordenTrabajoId: string, trx?: Trx) {
    return OtItem.query({ client: trx })
      .where('orden_trabajo_id', ordenTrabajoId)
      .whereNull('deleted_at')
      .whereIn('tipo', ['repuesto', 'material'])
      .whereNotNull('producto_id')
  }

  private async upsertReservaActiva(item: OtItem, userId: string, trx?: Trx): Promise<void> {
    const producto = await Producto.query({ client: trx })
      .where('id', item.productoId!)
      .whereNull('deleted_at')
      .first()

    if (!producto) {
      throw new Error(`PRODUCTO_NO_ENCONTRADO_OT:${item.descripcion}`)
    }

    const cantidad = Math.ceil(Number(item.cantidad))
    await this.validarReservaDisponible(producto.id, producto.stockActual, cantidad, item.id)

    const existente = await StockReserva.query({ client: trx })
      .where('ot_item_id', item.id)
      .whereNull('released_at')
      .first()

    if (existente) {
      existente.cantidad = cantidad
      existente.productoId = producto.id
      if (trx) existente.useTransaction(trx)
      await existente.save()
      return
    }

    await StockReserva.create(
      {
        id: randomUUID(),
        productoId: producto.id,
        ordenTrabajoId: item.ordenTrabajoId,
        otItemId: item.id,
        cantidad,
        userId,
      },
      trx ? { client: trx } : undefined
    )
  }
}
