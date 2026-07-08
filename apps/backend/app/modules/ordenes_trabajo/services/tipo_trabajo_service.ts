import type {
  CreateTipoTrabajoDTO,
  UpdateTipoTrabajoDTO,
} from '@gnc/shared-types'
import type User from '#models/user'
import TipoTrabajo from '#models/tipo_trabajo'
import { EntityCreated, EntityDeleted, EntityUpdated } from '#events/audit_events'
import TipoTrabajoRepository from '#modules/ordenes_trabajo/repositories/tipo_trabajo_repository'

export default class TipoTrabajoService {
  protected entityType = 'tipo_trabajo'
  private repository = new TipoTrabajoRepository()

  async list(includeInactive = false) {
    return this.repository.findAll(includeInactive)
  }

  async getById(id: string) {
    return this.repository.findById(id)
  }

  async create(data: CreateTipoTrabajoDTO, user: User) {
    const nombre = data.nombre.trim()
    const existing = await TipoTrabajo.query().whereILike('nombre', nombre).first()
    if (existing) {
      throw new Error('NOMBRE_DUPLICADO')
    }

    const tipo = await TipoTrabajo.create({
      nombre,
      descripcion: data.descripcion?.trim() || null,
      duracionEstimadaHoras: data.duracionEstimadaHoras ?? null,
      isActive: true,
    })

    await EntityCreated.dispatch({
      userId: user.id,
      entityType: this.entityType,
      entityId: tipo.id,
      newValues: { nombre: tipo.nombre },
    })

    return tipo
  }

  async update(id: string, data: UpdateTipoTrabajoDTO, user: User) {
    const tipo = await TipoTrabajo.find(id)
    if (!tipo) return null

    const oldValues = {
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      duracionEstimadaHoras: tipo.duracionEstimadaHoras,
      isActive: tipo.isActive,
    }

    if (data.nombre !== undefined) {
      const nombre = data.nombre.trim()
      const existing = await TipoTrabajo.query()
        .whereILike('nombre', nombre)
        .whereNot('id', id)
        .first()
      if (existing) {
        throw new Error('NOMBRE_DUPLICADO')
      }
      tipo.nombre = nombre
    }

    if (data.descripcion !== undefined) {
      tipo.descripcion = data.descripcion?.trim() || null
    }

    if (data.duracionEstimadaHoras !== undefined) {
      tipo.duracionEstimadaHoras = data.duracionEstimadaHoras
    }

    if (data.isActive !== undefined) {
      tipo.isActive = data.isActive
    }

    await tipo.save()

    await EntityUpdated.dispatch({
      userId: user.id,
      entityType: this.entityType,
      entityId: tipo.id,
      oldValues,
      newValues: {
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
        duracionEstimadaHoras: tipo.duracionEstimadaHoras,
        isActive: tipo.isActive,
      },
    })

    return tipo
  }

  async deactivate(id: string, user: User) {
    const tipo = await TipoTrabajo.find(id)
    if (!tipo) return false

    const ordenesActivas = await OrdenTrabajo.query()
      .where('tipo_trabajo_id', id)
      .whereNull('deleted_at')
      .whereNotIn('estado', ['entregada', 'cancelada'])
      .count('* as total')

    if (Number(ordenesActivas[0].$extras.total) > 0) {
      throw new Error('EN_USO')
    }

    const oldValues = { isActive: tipo.isActive }
    tipo.isActive = false
    await tipo.save()

    await EntityDeleted.dispatch({
      userId: user.id,
      entityType: this.entityType,
      entityId: id,
      oldValues: { ...oldValues, nombre: tipo.nombre },
    })

    return true
  }
}
