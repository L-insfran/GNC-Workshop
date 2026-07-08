import type { CreateKitItemDTO, UpdateKitItemDTO } from '@gnc/shared-types'
import type User from '#models/user'
import type KitTrabajoItem from '#models/kit_trabajo_item'
import TipoTrabajo from '#models/tipo_trabajo'
import Producto from '#models/producto'
import { EntityCreated, EntityDeleted, EntityUpdated } from '#events/audit_events'
import KitTrabajoRepository from '#modules/ordenes_trabajo/repositories/kit_trabajo_repository'
import { serializeKitTrabajoItems } from '#shared/kit_trabajo_serializer'

export default class KitTrabajoService {
  private repository = new KitTrabajoRepository()
  private entityType = 'kit_trabajo_item'

  async listByTipoTrabajo(tipoTrabajoId: string) {
    const tipo = await TipoTrabajo.find(tipoTrabajoId)
    if (!tipo) {
      throw new Error('TIPO_TRABAJO_INVALIDO')
    }

    const items = await this.repository.findByTipoTrabajoId(tipoTrabajoId)
    return serializeKitTrabajoItems(items)
  }

  async findItemsByTipoTrabajoId(tipoTrabajoId: string): Promise<KitTrabajoItem[]> {
    return this.repository.findByTipoTrabajoId(tipoTrabajoId)
  }

  async create(tipoTrabajoId: string, data: CreateKitItemDTO, user: User) {
    const tipo = await TipoTrabajo.find(tipoTrabajoId)
    if (!tipo || !tipo.isActive) {
      throw new Error('TIPO_TRABAJO_INVALIDO')
    }

    const { productoId, precioUnitario: precioProducto } = await this.resolveProducto(
      data.tipo,
      data.productoId
    )
    const orden =
      data.orden !== undefined ? Number(data.orden) : await this.repository.nextOrden(tipoTrabajoId)

    let precioUnitario: number | null = null
    if (data.precioUnitario !== undefined && data.precioUnitario !== null) {
      precioUnitario = Number(data.precioUnitario)
    } else if (precioProducto !== null) {
      precioUnitario = precioProducto
    }

    const item = await this.repository.create({
      tipoTrabajoId,
      tipo: data.tipo,
      productoId,
      descripcion: data.descripcion.trim(),
      cantidad: Number(data.cantidad),
      precioUnitario,
      esEstimado: data.esEstimado ?? true,
      orden,
    })

    try {
      await EntityCreated.dispatch({
        userId: user.id,
        entityType: this.entityType,
        entityId: item.id,
        newValues: { tipoTrabajoId, descripcion: item.descripcion },
      })
    } catch {
      // La auditoría no debe impedir el alta.
    }

    return item
  }

  async update(itemId: string, data: UpdateKitItemDTO, user: User) {
    const existing = await this.repository.findById(itemId)
    if (!existing) return null

    const tipo = data.tipo ?? existing.tipo
    let productoId =
      data.productoId === null ? null : (data.productoId ?? existing.productoId)

    if (data.productoId !== undefined || data.tipo !== undefined) {
      const resolved = await this.resolveProducto(tipo, productoId ?? undefined)
      productoId = resolved.productoId
    }

    const updated = await this.repository.update(itemId, {
      tipo,
      productoId,
      descripcion: data.descripcion?.trim() ?? existing.descripcion,
      cantidad: data.cantidad !== undefined ? Number(data.cantidad) : Number(existing.cantidad),
      precioUnitario:
        data.precioUnitario !== undefined
          ? data.precioUnitario === null
            ? null
            : Number(data.precioUnitario)
          : existing.precioUnitario,
      esEstimado: data.esEstimado ?? existing.esEstimado,
      orden: data.orden !== undefined ? Number(data.orden) : Number(existing.orden),
    })

    if (!updated) return null

    try {
      await EntityUpdated.dispatch({
        userId: user.id,
        entityType: this.entityType,
        entityId: itemId,
        oldValues: { descripcion: existing.descripcion },
        newValues: { descripcion: updated.descripcion },
      })
    } catch {
      // La auditoría no debe impedir la actualización.
    }

    return updated
  }

  async delete(itemId: string, user: User) {
    const existing = await this.repository.findById(itemId)
    if (!existing) return false

    const deleted = await this.repository.delete(itemId)
    if (!deleted) return false

    try {
      await EntityDeleted.dispatch({
        userId: user.id,
        entityType: this.entityType,
        entityId: itemId,
        oldValues: { descripcion: existing.descripcion },
      })
    } catch {
      // La auditoría no debe impedir la eliminación.
    }

    return true
  }

  private async resolveProducto(
    tipo: string,
    productoId?: string | null
  ): Promise<{ productoId: string | null; precioUnitario: number | null }> {
    if (!productoId) {
      if (tipo === 'repuesto' || tipo === 'material') {
        throw new Error('PRODUCTO_REQUERIDO')
      }
      return { productoId: null, precioUnitario: null }
    }

    if (tipo !== 'repuesto' && tipo !== 'material') {
      throw new Error('PRODUCTO_TIPO_INVALIDO')
    }

    const producto = await Producto.query()
      .where('id', productoId)
      .whereNull('deleted_at')
      .where('is_active', true)
      .first()

    if (!producto) {
      throw new Error('PRODUCTO_INVALIDO')
    }

    return { productoId: producto.id, precioUnitario: Number(producto.precioVenta) }
  }
}
