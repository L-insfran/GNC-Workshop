import type { CreateOtItemDTO, OrdenEstado, UpdateOtItemDTO } from '@gnc/shared-types'
import {
  OT_ITEM_DELETABLE_ESTADOS,
  OT_ITEM_EDITABLE_ESTADOS,
} from '@gnc/shared-types'
import type User from '#models/user'
import type OtItem from '#models/ot_item'
import OrdenTrabajo from '#models/orden_trabajo'
import Producto from '#models/producto'
import { EntityCreated, EntityDeleted, EntityUpdated } from '#events/audit_events'
import OtItemRepository from '#modules/ordenes_trabajo/repositories/ot_item_repository'
import {
  calcularIvaEstimado,
  calcularSubtotal,
  recalcularTotalesOrden,
} from '#modules/ordenes_trabajo/services/orden_trabajo_totales_service'
import { serializeOtItems } from '#shared/ot_item_serializer'

function puedeEditarItems(estado: OrdenEstado): boolean {
  return (OT_ITEM_EDITABLE_ESTADOS as readonly OrdenEstado[]).includes(estado)
}

function puedeEliminarItems(estado: OrdenEstado): boolean {
  return (OT_ITEM_DELETABLE_ESTADOS as readonly OrdenEstado[]).includes(estado)
}

export default class OtItemService {
  private repository = new OtItemRepository()

  async getPresupuesto(ordenTrabajoId: string) {
    const orden = await OrdenTrabajo.query()
      .where('id', ordenTrabajoId)
      .whereNull('deleted_at')
      .first()

    if (!orden) return null

    const items = await this.repository.findByOrdenTrabajoId(ordenTrabajoId)
    const totalFinal = Number(orden.totalFinal ?? 0)
    const totalEstimado = Number(orden.totalEstimado ?? 0)
    const ivaEstimado = calcularIvaEstimado(totalFinal)

    return {
      items: serializeOtItems(items),
      totalEstimado,
      totalFinal,
      ivaEstimado,
      totalConIva: Number((totalFinal + ivaEstimado).toFixed(2)),
      puedeEditar: puedeEditarItems(orden.estado),
      puedeEliminar: puedeEliminarItems(orden.estado),
    }
  }

  async create(ordenTrabajoId: string, data: CreateOtItemDTO, user: User): Promise<OtItem> {
    const orden = await this.getOrdenEditable(ordenTrabajoId)

    const descripcion = data.descripcion.trim()
    let productoId: string | null = data.productoId ?? null
    let precioUnitario = Number(data.precioUnitario)

    if (productoId) {
      const producto = await Producto.query()
        .where('id', productoId)
        .whereNull('deleted_at')
        .where('is_active', true)
        .first()

      if (!producto) {
        throw new Error('PRODUCTO_INVALIDO')
      }

      if (data.tipo !== 'repuesto' && data.tipo !== 'material') {
        throw new Error('PRODUCTO_TIPO_INVALIDO')
      }

      if (!data.precioUnitario) {
        precioUnitario = Number(producto.precioVenta)
      }
    }

    const cantidad = Number(data.cantidad)
    const subtotal = calcularSubtotal(cantidad, precioUnitario)

    const item = await this.repository.create({
      ordenTrabajoId,
      tipo: data.tipo,
      productoId,
      descripcion,
      cantidad,
      precioUnitario,
      subtotal,
      esEstimado: data.esEstimado ?? true,
      createdBy: user.id,
    })

    await recalcularTotalesOrden(ordenTrabajoId)

    try {
      await EntityCreated.dispatch({
        userId: user.id,
        entityType: 'ot_item',
        entityId: item.id,
        newValues: { ordenTrabajoId, descripcion, subtotal },
      })
    } catch {
      // La auditoría no debe impedir el alta del ítem.
    }

    return (await this.repository.findByIdForOrden(ordenTrabajoId, item.id))!
  }

  async update(
    ordenTrabajoId: string,
    itemId: string,
    data: UpdateOtItemDTO,
    user: User
  ): Promise<OtItem | null> {
    const orden = await this.getOrdenEditable(ordenTrabajoId)
    const item = await this.repository.findByIdForOrden(ordenTrabajoId, itemId)

    if (!item) return null

    const tipo = data.tipo ?? item.tipo
    let productoId = data.productoId === null ? null : (data.productoId ?? item.productoId)
    let descripcion = data.descripcion?.trim() ?? item.descripcion
    let precioUnitario =
      data.precioUnitario !== undefined ? Number(data.precioUnitario) : Number(item.precioUnitario)
    const cantidad = data.cantidad !== undefined ? Number(data.cantidad) : Number(item.cantidad)

    if (productoId) {
      const producto = await Producto.query()
        .where('id', productoId)
        .whereNull('deleted_at')
        .where('is_active', true)
        .first()

      if (!producto) {
        throw new Error('PRODUCTO_INVALIDO')
      }

      if (tipo !== 'repuesto' && tipo !== 'material') {
        throw new Error('PRODUCTO_TIPO_INVALIDO')
      }
    } else if (tipo === 'repuesto' || tipo === 'material') {
      productoId = null
    }

    const subtotal = calcularSubtotal(cantidad, precioUnitario)

    const updated = await this.repository.update(itemId, {
      tipo,
      productoId,
      descripcion,
      cantidad,
      precioUnitario,
      subtotal,
      esEstimado: data.esEstimado ?? item.esEstimado,
    })

    if (!updated) return null

    await recalcularTotalesOrden(ordenTrabajoId)

    try {
      await EntityUpdated.dispatch({
        userId: user.id,
        entityType: 'ot_item',
        entityId: itemId,
        oldValues: { descripcion: item.descripcion, subtotal: item.subtotal },
        newValues: { descripcion, subtotal },
      })
    } catch {
      // La auditoría no debe impedir la actualización del ítem.
    }

    return this.repository.findByIdForOrden(ordenTrabajoId, itemId)
  }

  async delete(ordenTrabajoId: string, itemId: string, user: User): Promise<boolean> {
    const orden = await OrdenTrabajo.query()
      .where('id', ordenTrabajoId)
      .whereNull('deleted_at')
      .first()

    if (!orden) return false

    if (!puedeEliminarItems(orden.estado)) {
      throw new Error('OT_ITEMS_BLOQUEADOS')
    }

    const item = await this.repository.findByIdForOrden(ordenTrabajoId, itemId)
    if (!item) return false

    const deleted = await this.repository.softDelete(itemId)
    if (!deleted) return false

    await recalcularTotalesOrden(ordenTrabajoId)

    try {
      await EntityDeleted.dispatch({
        userId: user.id,
        entityType: 'ot_item',
        entityId: itemId,
        oldValues: { descripcion: item.descripcion, subtotal: item.subtotal },
      })
    } catch {
      // La auditoría no debe impedir la eliminación del ítem.
    }

    return true
  }

  private async getOrdenEditable(ordenTrabajoId: string): Promise<OrdenTrabajo> {
    const orden = await OrdenTrabajo.query()
      .where('id', ordenTrabajoId)
      .whereNull('deleted_at')
      .first()

    if (!orden) {
      throw new Error('OT_NO_ENCONTRADA')
    }

    if (!puedeEditarItems(orden.estado)) {
      throw new Error('OT_ITEMS_BLOQUEADOS')
    }

    return orden
  }
}
