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
import { serializeFactura, buildCobroFacturaResumen } from '#shared/factura_serializer'
import { aplicarSenasAFactura, sumAllSenasByOrdenTrabajoId } from '#shared/ot_sena_util'
import FacturaRepository from '#modules/facturacion/repositories/factura_repository'

const IVA_RATE = 0.21

export default class FacturaService extends BaseService<Factura> {
  protected entityType = 'factura'
  protected repository = new FacturaRepository()

  async list(params?: IPaginationParams) {
    const result = await this.repository.findAllWithRelations(params)
    const data = await Promise.all(
      result.data.map(async (factura) => {
        const cobros = await this.repository.findCobrosByFacturaId(factura.id)
        return serializeFactura(factura, { cobros })
      })
    )
    return { data, meta: result.meta }
  }

  async getById(id: string): Promise<IFactura | null> {
    const factura = await this.repository.findByIdWithRelations(id)
    if (!factura) return null
    const cobros = await this.repository.findCobrosByFacturaId(factura.id)
    const notaCredito = await this.repository.findNotaCreditoByFacturaReferenciaId(factura.id)
    return serializeFactura(factura, { cobros, notaCredito })
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

    const cobros = await this.repository.findCobrosByFacturaId(factura.id)
    const notaCredito = await this.repository.findNotaCreditoByFacturaReferenciaId(factura.id)
    const hayActiva = Boolean(activa)
    const esEmitida = factura.estado === 'emitida'
    const totalSenaOt = await sumAllSenasByOrdenTrabajoId(ordenTrabajoId)
    const cobroResumen = buildCobroFacturaResumen(Number(factura.total), cobros)

    return {
      factura: serializeFactura(factura, { cobros, notaCredito }),
      cobrada: cobroResumen.cobrada,
      estadoCobro: cobroResumen.estadoCobro,
      totalCobrado: cobroResumen.totalCobrado,
      totalSenaOt,
      saldoPendiente: cobroResumen.saldoPendiente,
      cobroMovimientoId: cobroResumen.ultimoCobroId,
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

    // La NC se vincula solo por facturaReferenciaId; no copia ordenTrabajoId
    // para no chocar con el índice único facturas_ot_activa_unique.
    return {
      clienteId: factura.clienteId,
      facturaReferenciaId: factura.id,
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

    const esNotaCredito = data.tipo === 'nota_credito'
    // NC no ocupa el cupo de factura activa de la OT.
    const ordenTrabajoId = esNotaCredito ? null : (data.ordenTrabajoId ?? null)

    if (esNotaCredito) {
      await this.validarNotaCredito(data)
    } else if (ordenTrabajoId) {
      const facturaActiva = await this.repository.findActivaByOrdenTrabajoId(ordenTrabajoId)
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
    const numero = esNotaCredito
      ? await this.repository.generateNumeroNotaCredito()
      : await this.repository.generateNumero()
    const estado = data.emitir === false ? 'borrador' : 'emitida'

    let facturaId = ''

    await db.transaction(async (trx) => {
      const factura = await Factura.create(
        {
          numero,
          clienteId: data.clienteId,
          ordenTrabajoId,
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

      if (ordenTrabajoId) {
        await aplicarSenasAFactura(ordenTrabajoId, factura.id, trx)
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

    const cobros = await this.repository.findCobrosByFacturaId(factura.id)
    if (cobros.length > 0) {
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
