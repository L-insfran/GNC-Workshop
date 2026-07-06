import type User from '#models/user'
import Vehiculo from '#models/vehiculo'
import VehiculoMarca from '#models/vehiculo_marca'
import VehiculoModelo from '#models/vehiculo_modelo'
import { EntityCreated, EntityDeleted, EntityUpdated } from '#events/audit_events'

export default class VehiculoModeloService {
  protected entityType = 'vehiculo_modelo'

  async list(marcaId?: string) {
    const query = VehiculoModelo.query().orderBy('nombre', 'asc')
    if (marcaId) {
      query.where('marca_id', marcaId)
    }
    return query
  }

  async getById(id: string) {
    return VehiculoModelo.find(id)
  }

  async create(data: { marcaId: string; nombre: string }, user: User) {
    const marca = await VehiculoMarca.find(data.marcaId)
    if (!marca) {
      throw new Error('MARCA_NO_ENCONTRADA')
    }

    const nombre = data.nombre.trim()
    const existing = await VehiculoModelo.query()
      .where('marca_id', data.marcaId)
      .whereILike('nombre', nombre)
      .first()
    if (existing) {
      throw new Error('NOMBRE_DUPLICADO')
    }

    const modelo = await VehiculoModelo.create({
      marcaId: data.marcaId,
      nombre,
    })

    await EntityCreated.dispatch({
      userId: user.id,
      entityType: this.entityType,
      entityId: modelo.id,
      newValues: { marcaId: modelo.marcaId, nombre: modelo.nombre },
    })
    return modelo
  }

  async update(id: string, data: { nombre: string }, user: User) {
    const modelo = await VehiculoModelo.find(id)
    if (!modelo) return null

    const nombre = data.nombre.trim()
    const existing = await VehiculoModelo.query()
      .where('marca_id', modelo.marcaId)
      .whereILike('nombre', nombre)
      .whereNot('id', id)
      .first()
    if (existing) {
      throw new Error('NOMBRE_DUPLICADO')
    }

    const oldValues = { nombre: modelo.nombre }
    modelo.nombre = nombre
    await modelo.save()

    await EntityUpdated.dispatch({
      userId: user.id,
      entityType: this.entityType,
      entityId: modelo.id,
      oldValues,
      newValues: { nombre: modelo.nombre },
    })
    return modelo
  }

  async delete(id: string, user: User) {
    const modelo = await VehiculoModelo.find(id)
    if (!modelo) return false

    const vehiculosCount = await Vehiculo.query().where('modelo_id', id).count('* as total')
    if (Number(vehiculosCount[0].$extras.total) > 0) {
      throw new Error('EN_USO')
    }

    await modelo.delete()
    await EntityDeleted.dispatch({
      userId: user.id,
      entityType: this.entityType,
      entityId: id,
      oldValues: { nombre: modelo.nombre },
    })
    return true
  }
}
