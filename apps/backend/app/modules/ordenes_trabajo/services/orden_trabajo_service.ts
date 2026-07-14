import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import {
  getOrdenEstadosSiguientes,
  type CreateOrdenTrabajoDTO,
  type IFacturaBorradorPreview,
  type IOrdenTrabajoListParams,
  type OrdenEstado,
  type UpdateOrdenEstadoDTO,
} from '@gnc/shared-types'
import type User from '#models/user'
import type OrdenTrabajo from '#models/orden_trabajo'
import EquipoGnc from '#models/equipo_gnc'
import Cilindro from '#models/cilindro'
import OtItem from '#models/ot_item'
import Producto from '#models/producto'
import TipoTrabajo from '#models/tipo_trabajo'
import Vehiculo from '#models/vehiculo'
import { BaseService } from '#shared/base_service'
import { parseDateOnly } from '#shared/date_util'
import { validarEquipoParaNuevaOt } from '#shared/equipo_gnc_validacion_util'
import { countActiveMecanicos, findActiveMecanico } from '#shared/mecanico_util'
import OtItemService from '#modules/ordenes_trabajo/services/ot_item_service'
import KitTrabajoService from '#modules/ordenes_trabajo/services/kit_trabajo_service'
import FacturaRepository from '#modules/facturacion/repositories/factura_repository'
import OrdenTrabajoRepository from '#modules/ordenes_trabajo/repositories/orden_trabajo_repository'
import OtItemRepository from '#modules/ordenes_trabajo/repositories/ot_item_repository'
import StockReservaService from '#modules/inventario/services/stock_reserva_service'
import CajaRepository from '#modules/caja/repositories/caja_repository'
import OtEquipoRegulatoryService from '#modules/ordenes_trabajo/services/ot_equipo_regulatory_service'
import OtControlCalidadService from '#modules/ordenes_trabajo/services/ot_control_calidad_service'

function resolveFechaEstimadaEntrega(
  value: string | undefined,
  fechaIngreso: DateTime,
  tipoTrabajo: TipoTrabajo
): DateTime | null {
  if (value) {
    const fechaEstimada = parseDateOnly(value, 'fechaEstimadaEntrega')
    const ingresoDia = fechaIngreso.setZone('utc').startOf('day')

    if (fechaEstimada < ingresoDia) {
      throw new Error('FECHA_ENTREGA_INVALIDA')
    }

    return fechaEstimada
  }

  const diasEstimados = Math.max(1, Math.ceil((tipoTrabajo.duracionEstimadaHoras ?? 8) / 8))
  return fechaIngreso.setZone('utc').startOf('day').plus({ days: diasEstimados - 1 })
}

export default class OrdenTrabajoService extends BaseService<OrdenTrabajo> {
  protected entityType = 'orden_trabajo'
  protected repository = new OrdenTrabajoRepository()
  private facturaRepository = new FacturaRepository()
  private otItemRepository = new OtItemRepository()
  private stockReservaService = new StockReservaService()
  private otEquipoRegulatoryService = new OtEquipoRegulatoryService()
  private otControlCalidadService = new OtControlCalidadService()
  private cajaRepository = new CajaRepository()
  private kitTrabajoService = new KitTrabajoService()
  private otItemService = new OtItemService()

  async list(params?: IOrdenTrabajoListParams) {
    const result = await this.repository.findAllWithRelations(params)
    const ordenIds = result.data.map((orden) => orden.id)
    const estados = new Map(result.data.map((orden) => [orden.id, orden.estado]))
    const [resumenesCobro, resumenesMargen] = await Promise.all([
      this.facturaRepository.findCobroResumenByOrdenTrabajoIds(ordenIds, estados),
      this.otItemRepository.findMargenResumenByOrdenTrabajoIds(ordenIds),
    ])

    return { data: result.data, meta: result.meta, resumenesCobro, resumenesMargen }
  }

  async getById(id: string): Promise<OrdenTrabajo | null> {
    return this.repository.findByIdWithRelations(id)
  }

  async getFacturaBorrador(id: string): Promise<IFacturaBorradorPreview | null> {
    const orden = await this.repository.findByIdWithRelations(id)
    if (!orden) return null

    if (orden.estado !== 'finalizada' && orden.estado !== 'entregada') {
      throw new Error('OT_ESTADO_INVALIDO_FACTURA')
    }

    const facturaActiva = await this.facturaRepository.findActivaByOrdenTrabajoId(id)
    if (facturaActiva) {
      throw new Error('OT_YA_FACTURADA')
    }

    const presupuesto = await this.otItemService.getPresupuesto(id)

    if (!presupuesto?.items.length) {
      throw new Error('OT_SIN_ITEMS')
    }

    return {
      clienteId: orden.clienteId,
      ordenTrabajoId: orden.id,
      ordenNumero: orden.numero,
      clienteNombre: orden.cliente?.razonSocial,
      tipo: 'factura_b',
      items: presupuesto.items.map((item) => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      })),
      emitir: true,
    }
  }

  async create(data: CreateOrdenTrabajoDTO, user: User): Promise<OrdenTrabajo> {
    const vehiculo = await Vehiculo.query()
      .where('id', data.vehiculoId)
      .where('cliente_id', data.clienteId)
      .whereNull('deleted_at')
      .first()

    if (!vehiculo) {
      throw new Error('VEHICULO_INVALIDO')
    }

    const tipoTrabajo = await TipoTrabajo.find(data.tipoTrabajoId)
    if (!tipoTrabajo || !tipoTrabajo.isActive) {
      throw new Error('TIPO_TRABAJO_INVALIDO')
    }

    if (data.equipoGncId) {
      const equipo = await EquipoGnc.query()
        .where('id', data.equipoGncId)
        .where('vehiculo_id', data.vehiculoId)
        .whereNull('deleted_at')
        .first()

      if (!equipo) {
        throw new Error('EQUIPO_INVALIDO')
      }

      const cilindros = await Cilindro.query()
        .where('equipo_gnc_id', equipo.id)
        .whereNull('deleted_at')

      validarEquipoParaNuevaOt(equipo, cilindros, tipoTrabajo.nombre)
    }

    const numero = await this.repository.generateNumero()
    const fechaIngreso = DateTime.now()

    if (data.mecanicoAsignadoId) {
      const mecanico = await findActiveMecanico(data.mecanicoAsignadoId)
      if (!mecanico) {
        throw new Error('MECANICO_INVALIDO')
      }
    }

    const orden = await super.create(
      {
        numero,
        clienteId: data.clienteId,
        vehiculoId: data.vehiculoId,
        equipoGncId: data.equipoGncId ?? null,
        tipoTrabajoId: data.tipoTrabajoId,
        estado: 'borrador',
        prioridad: data.prioridad ?? 'normal',
        fechaIngreso,
        fechaEstimadaEntrega: resolveFechaEstimadaEntrega(
          data.fechaEstimadaEntrega,
          fechaIngreso,
          tipoTrabajo
        ),
        mecanicoAsignadoId: data.mecanicoAsignadoId ?? null,
        recepcionistaId: user.id,
        kilometrajeIngreso: data.kilometrajeIngreso ?? null,
        descripcionProblema: data.descripcionProblema ?? null,
        observacionesInternas: data.observacionesInternas ?? null,
      },
      user
    )

    if (data.montoSena && data.montoSena > 0) {
      const caja = await this.cajaRepository.getOrCreateDefault()
      await this.cajaRepository.createMovimiento({
        cajaId: caja.id,
        tipo: 'ingreso',
        monto: data.montoSena,
        concepto: `Seña OT ${numero}`,
        ordenTrabajoId: orden.id,
        userId: user.id,
      })
    }

    try {
      const kitItems = await this.kitTrabajoService.findItemsByTipoTrabajoId(data.tipoTrabajoId)
      await this.otItemService.createManyFromKit(orden.id, kitItems, user)
    } catch {
      // La OT ya fue creada; un fallo al aplicar el kit no debe revertir el alta.
    }

    return (await this.repository.findByIdWithRelations(orden.id))!
  }

  async registrarSena(ordenId: string, monto: number, user: User): Promise<OrdenTrabajo> {
    const orden = await this.repository.findById(ordenId)
    if (!orden) {
      throw new Error('NOT_FOUND')
    }

    if (orden.estado === 'cancelada' || orden.estado === 'entregada') {
      throw new Error('OT_ESTADO_INVALIDO_SENA')
    }

    const facturaActiva = await this.facturaRepository.findActivaByOrdenTrabajoId(ordenId)
    if (facturaActiva) {
      throw new Error('OT_YA_FACTURADA')
    }

    const caja = await this.cajaRepository.getOrCreateDefault()
    await this.cajaRepository.createMovimiento({
      cajaId: caja.id,
      tipo: 'ingreso',
      monto,
      concepto: `Seña OT ${orden.numero}`,
      ordenTrabajoId: orden.id,
      userId: user.id,
    })

    return (await this.repository.findByIdWithRelations(ordenId))!
  }

  async update(id: string, data: Partial<OrdenTrabajo>, user: User): Promise<OrdenTrabajo | null> {
    const existing = await this.repository.findById(id)
    if (!existing) return null

    if (data.fechaEstimadaEntrega) {
      const fechaEstimada = data.fechaEstimadaEntrega.setZone('utc').startOf('day')
      const ingresoDia = existing.fechaIngreso.setZone('utc').startOf('day')

      if (fechaEstimada < ingresoDia) {
        throw new Error('FECHA_ENTREGA_INVALIDA')
      }
    }

    if (data.mecanicoAsignadoId) {
      const mecanico = await findActiveMecanico(data.mecanicoAsignadoId)
      if (!mecanico) {
        throw new Error('MECANICO_INVALIDO')
      }
    }

    const updated = await super.update(id, data, user)
    if (!updated) return null
    return this.repository.findByIdWithRelations(id)
  }

  async updateEstado(
    id: string,
    dto: UpdateOrdenEstadoDTO,
    user: User
  ): Promise<OrdenTrabajo | null> {
    const orden = await this.repository.findById(id)
    if (!orden) return null

    const estadoActual = orden.estado
    const estadoNuevo = dto.estado

    if (estadoActual === estadoNuevo) {
      return this.repository.findByIdWithRelations(id)
    }

    const transiciones = getOrdenEstadosSiguientes(estadoActual)
    if (!transiciones.includes(estadoNuevo)) {
      throw new Error('TRANSICION_INVALIDA')
    }

    if (estadoNuevo === 'entregada' && estadoActual !== 'finalizada') {
      throw new Error('TRANSICION_INVALIDA')
    }

    if (estadoNuevo === 'finalizada' && estadoActual === 'control_calidad') {
      await this.otControlCalidadService.assertAprobadoParaFinalizar(id)
    }

    if (estadoNuevo === 'entregada') {
      await this.assertCobroOkParaEntrega(id, estadoActual)
    }

    const updateData: Partial<OrdenTrabajo> = { estado: estadoNuevo }
    if (estadoNuevo === 'entregada') {
      updateData.fechaEntregaReal = DateTime.now()
    }

    if (estadoNuevo === 'en_taller') {
      const mecanicosDisponibles = await countActiveMecanicos()
      if (mecanicosDisponibles === 0) {
        throw new Error('SIN_MECANICOS_REGISTRADOS')
      }

      const mecanicoId = dto.mecanicoAsignadoId ?? orden.mecanicoAsignadoId
      if (!mecanicoId) {
        throw new Error('MECANICO_REQUERIDO')
      }

      const mecanico = await findActiveMecanico(mecanicoId)
      if (!mecanico) {
        throw new Error('MECANICO_INVALIDO')
      }

      updateData.mecanicoAsignadoId = mecanicoId
    }

    const trx = await db.transaction()

    try {
      if (estadoNuevo === 'en_taller') {
        await this.stockReservaService.reservarStockPorOt(id, user.id, trx)
      }

      if (estadoNuevo === 'finalizada') {
        await this.descontarStockPorOt(id, orden.numero, user.id, trx)

        if (orden.equipoGncId) {
          const tipoTrabajo = await TipoTrabajo.findOrFail(orden.tipoTrabajoId)
          await this.otEquipoRegulatoryService.aplicarAlFinalizar(
            orden.equipoGncId,
            tipoTrabajo,
            trx
          )
        }

        await this.stockReservaService.liberarReservasPorOt(id, 'finalizada', trx)
      }

      if (estadoNuevo === 'cancelada') {
        await this.stockReservaService.liberarReservasPorOt(id, 'cancelada', trx)
      }

      orden.useTransaction(trx)
      orden.merge(updateData)
      await orden.save()

      await trx
        .table('ot_estados_historial')
        .insert({
          orden_trabajo_id: orden.id,
          estado_anterior: estadoActual,
          estado_nuevo: estadoNuevo,
          user_id: user.id,
          observacion: dto.observacion ?? null,
          created_at: DateTime.now().toSQL(),
        })

      await trx.commit()

      const { EntityUpdated } = await import('#events/audit_events')
      await EntityUpdated.dispatch({
        userId: user.id,
        entityType: this.entityType,
        entityId: orden.id,
        oldValues: { estado: estadoActual },
        newValues: { estado: estadoNuevo },
      })

      return this.repository.findByIdWithRelations(id)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  private async assertCobroOkParaEntrega(ordenId: string, estadoActual: OrdenEstado): Promise<void> {
    const resumenes = await this.facturaRepository.findCobroResumenByOrdenTrabajoIds(
      [ordenId],
      new Map([[ordenId, estadoActual]])
    )
    const resumen = resumenes.get(ordenId)
    if (!resumen) return

    if (resumen.estado === 'pendiente' || resumen.estado === 'parcial') {
      throw new Error('COBRO_PENDIENTE_ENTREGA')
    }

    if (resumen.estado === 'borrador') {
      throw new Error('FACTURA_BORRADOR_ENTREGA')
    }
  }

  private async descontarStockPorOt(
    ordenTrabajoId: string,
    ordenNumero: string,
    userId: string,
    trx: Awaited<ReturnType<typeof db.transaction>>
  ): Promise<void> {
    const items = await OtItem.query({ client: trx })
      .where('orden_trabajo_id', ordenTrabajoId)
      .whereNull('deleted_at')
      .whereIn('tipo', ['repuesto', 'material'])
      .whereNotNull('producto_id')

    const now = DateTime.now().toSQL()

    for (const item of items) {
      const producto = await Producto.query({ client: trx })
        .where('id', item.productoId!)
        .whereNull('deleted_at')
        .first()

      if (!producto) {
        throw new Error(`PRODUCTO_NO_ENCONTRADO_OT:${item.descripcion}`)
      }

      const cantidad = Math.ceil(Number(item.cantidad))

      if (producto.stockActual < cantidad) {
        throw new Error(`STOCK_INSUFICIENTE_OT:${producto.nombre}`)
      }

      await trx
        .from('productos')
        .where('id', producto.id)
        .decrement('stock_actual', cantidad)

      await trx.table('stock_movimientos').insert({
        id: randomUUID(),
        producto_id: producto.id,
        tipo: 'egreso',
        cantidad,
        motivo: `OT ${ordenNumero}`,
        orden_trabajo_id: ordenTrabajoId,
        user_id: userId,
        created_at: now,
      })
    }
  }
}
