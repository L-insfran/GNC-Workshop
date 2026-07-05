import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { CreateFacturaDTO, IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import Factura from '#models/factura'
import FacturaItem from '#models/factura_item'
import Cliente from '#models/cliente'
import { BaseService } from '#shared/base_service'
import FacturaRepository from '#modules/facturacion/repositories/factura_repository'

const IVA_RATE = 0.21

export default class FacturaService extends BaseService<Factura> {
  protected entityType = 'factura'
  protected repository = new FacturaRepository()

  async list(params?: IPaginationParams) {
    return this.repository.findAllWithRelations(params)
  }

  async getById(id: string): Promise<Factura | null> {
    return this.repository.findByIdWithRelations(id)
  }

  async create(data: CreateFacturaDTO, user: User): Promise<Factura> {
    const cliente = await Cliente.query()
      .where('id', data.clienteId)
      .whereNull('deleted_at')
      .first()

    if (!cliente) {
      throw new Error('CLIENTE_NO_ENCONTRADO')
    }

    if (!data.items?.length) {
      throw new Error('ITEMS_REQUERIDOS')
    }

    const items = data.items.map((item) => ({
      descripcion: item.descripcion.trim(),
      cantidad: Number(item.cantidad),
      precioUnitario: Number(item.precioUnitario),
      subtotal: Number(item.cantidad) * Number(item.precioUnitario),
    }))

    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0)
    const aplicaIva = data.tipo === 'factura_a' || data.tipo === 'factura_b'
    const iva = aplicaIva ? Number((subtotal * IVA_RATE).toFixed(2)) : 0
    const total = Number((subtotal + iva).toFixed(2))
    const numero = await this.repository.generateNumero()
    const estado = data.emitir === false ? 'borrador' : 'emitida'

    let facturaId = ''

    await db.transaction(async (trx) => {
      const factura = await Factura.create(
        {
          numero,
          clienteId: data.clienteId,
          ordenTrabajoId: data.ordenTrabajoId ?? null,
          tipo: data.tipo,
          subtotal,
          iva,
          total,
          estado,
          fechaEmision: DateTime.utc(),
        },
        { client: trx }
      )

      facturaId = factura.id

      for (const item of items) {
        await FacturaItem.create(
          {
            facturaId: factura.id,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.subtotal,
          },
          { client: trx }
        )
      }
    })

    try {
      const { EntityCreated } = await import('#events/audit_events')
      await EntityCreated.dispatch({
        userId: user.id,
        entityType: this.entityType,
        entityId: facturaId,
        newValues: { numero, total, estado },
      })
    } catch {
      // auditoría no bloquea
    }

    return (await this.repository.findByIdWithRelations(facturaId))!
  }

  async anular(id: string, user: User): Promise<Factura> {
    const factura = await this.repository.findById(id)
    if (!factura) {
      throw new Error('FACTURA_NO_ENCONTRADA')
    }

    if (factura.estado === 'anulada') {
      throw new Error('FACTURA_YA_ANULADA')
    }

    const updated = await super.update(id, { estado: 'anulada' }, user)
    return (await this.repository.findByIdWithRelations(updated!.id))!
  }
}
