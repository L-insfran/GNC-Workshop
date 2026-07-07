import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type {
  CreateFacturaDTO,
  IFactura,
  IFacturaBorradorPreview,
  IFacturaVinculadaOT,
  IPaginationParams,
} from '@gnc/shared-types'
import type User from '#models/user'
import Factura from '#models/factura'
import FacturaItem from '#models/factura_item'
import Cliente from '#models/cliente'
import { BaseService } from '#shared/base_service'
import { serializeFactura } from '#shared/factura_serializer'
import FacturaRepository from '#modules/facturacion/repositories/factura_repository'

const IVA_RATE = 0.21

export default class FacturaService extends BaseService<Factura> {
  protected entityType = 'factura'
  protected repository = new FacturaRepository()

  async list(params?: IPaginationParams) {
    const result = await this.repository.findAllWithRelations(params)
    const data = await Promise.all(
      result.data.map(async (factura) => {
        const cobro = await this.repository.findCobroByFacturaId(factura.id)
        return serializeFactura(factura, cobro)
      })
    )
    return { data, meta: result.meta }
  }

  async getById(id: string): Promise<IFactura | null> {
    const factura = await this.repository.findByIdWithRelations(id)
    if (!factura) return null
    const cobro = await this.repository.findCobroByFacturaId(factura.id)
    const notaCredito = await this.repository.findNotaCreditoByFacturaReferenciaId(factura.id)
    return serializeFactura(factura, { cobro, notaCredito })
  }

  async getFacturaVinculadaOT(ordenTrabajoId: string): Promise<IFacturaVinculadaOT | null> {
    const activa = await this.repository.findActivaByOrdenTrabajoId(ordenTrabajoId)
    const factura = activa ?? (await this.repository.findLatestByOrdenTrabajoId(ordenTrabajoId))

    if (!factura) {
      return null
    }

    if (!factura.cliente) {
      await factura.load('cliente')
    }
    if (!factura.items?.length) {
      await factura.load('items')
    }

    const cobro = await this.repository.findCobroByFacturaId(factura.id)
    const notaCredito = await this.repository.findNotaCreditoByFacturaReferenciaId(factura.id)
    const hayActiva = Boolean(activa)
    const esEmitida = factura.estado === 'emitida'

    return {
      factura: serializeFactura(factura, cobro),
      cobrada: Boolean(cobro),
      cobroMovimientoId: cobro?.id,
      puedeEmitirNotaCredito: esEmitida && !notaCredito,
      notaCreditoId: notaCredito?.id,
      puedeGenerarFactura: !hayActiva,
    }
  }

  async getNotaCreditoBorrador(facturaId: string): Promise<IFacturaBorradorPreview | null> {
    const factura = await this.repository.findByIdWithRelations(facturaId)
    if (!factura) return null

    if (factura.estado !== 'emitida') {
      throw new Error('FACTURA_NO_EMITIDA')
    }

    if (factura.tipo === 'nota_credito') {
      throw new Error('NC_DESDE_NC_NO_PERMITIDA')
    }

    const notaCreditoExistente = await this.repository.findNotaCreditoByFacturaReferenciaId(
      factura.id
    )
    if (notaCreditoExistente) {
      throw new Error('NC_YA_EMITIDA')
    }

    return {
      clienteId: factura.clienteId,
      facturaReferenciaId: factura.id,
      ordenTrabajoId: factura.ordenTrabajoId ?? undefined,
      tipo: 'nota_credito',
      items: factura.items.map((item) => ({
        descripcion: item.descripcion,
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario),
      })),
      emitir: true,
    }
  }

  async create(data: CreateFacturaDTO, user: User): Promise<IFactura> {
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

    if (data.tipo === 'nota_credito') {
      await this.validarNotaCredito(data)
    } else if (data.ordenTrabajoId) {
      const facturaActiva = await this.repository.findActivaByOrdenTrabajoId(data.ordenTrabajoId)
      if (facturaActiva) {
        throw new Error('OT_YA_FACTURADA')
      }
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
    const numero =
      data.tipo === 'nota_credito'
        ? await this.repository.generateNumeroNotaCredito()
        : await this.repository.generateNumero()
    const estado = data.emitir === false ? 'borrador' : 'emitida'

    let facturaId = ''

    await db.transaction(async (trx) => {
      const factura = await Factura.create(
        {
          numero,
          clienteId: data.clienteId,
          ordenTrabajoId: data.ordenTrabajoId ?? null,
          facturaReferenciaId: data.facturaReferenciaId ?? null,
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
        newValues: { numero, total, estado, tipo: data.tipo },
      })
    } catch {
      // auditoría no bloquea
    }

    return (await this.getById(facturaId))!
  }

  async anular(id: string, user: User): Promise<IFactura> {
    const factura = await this.repository.findById(id)
    if (!factura) {
      throw new Error('FACTURA_NO_ENCONTRADA')
    }

    if (factura.estado === 'anulada') {
      throw new Error('FACTURA_YA_ANULADA')
    }

    const cobro = await this.repository.findCobroByFacturaId(factura.id)
    if (cobro) {
      throw new Error('FACTURA_CON_COBRO')
    }

    const notaCredito = await this.repository.findNotaCreditoByFacturaReferenciaId(factura.id)
    if (notaCredito) {
      throw new Error('FACTURA_CON_NC')
    }

    await super.update(id, { estado: 'anulada' }, user)
    return (await this.getById(id))!
  }

  private async validarNotaCredito(data: CreateFacturaDTO): Promise<void> {
    if (!data.facturaReferenciaId) {
      throw new Error('FACTURA_REFERENCIA_REQUERIDA')
    }

    const facturaOriginal = await this.repository.findByIdWithRelations(data.facturaReferenciaId)
    if (!facturaOriginal) {
      throw new Error('FACTURA_REFERENCIA_NO_ENCONTRADA')
    }

    if (facturaOriginal.estado !== 'emitida') {
      throw new Error('FACTURA_NO_EMITIDA')
    }

    if (facturaOriginal.tipo === 'nota_credito') {
      throw new Error('NC_DESDE_NC_NO_PERMITIDA')
    }

    const notaCreditoExistente = await this.repository.findNotaCreditoByFacturaReferenciaId(
      facturaOriginal.id
    )
    if (notaCreditoExistente) {
      throw new Error('NC_YA_EMITIDA')
    }

    if (data.clienteId !== facturaOriginal.clienteId) {
      throw new Error('CLIENTE_NC_INVALIDO')
    }
  }
}
