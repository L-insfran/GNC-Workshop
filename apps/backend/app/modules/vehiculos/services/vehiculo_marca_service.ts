import type User from '#models/user'
import Vehiculo from '#models/vehiculo'
import VehiculoMarca from '#models/vehiculo_marca'
import VehiculoModelo from '#models/vehiculo_modelo'
import { EntityCreated, EntityDeleted, EntityUpdated } from '#events/audit_events'

export default class VehiculoMarcaService {
  protected entityType = 'vehiculo_marca'

  async list() {
    return VehiculoMarca.query().orderBy('nombre', 'asc')
  }

  async getById(id: string) {
    return VehiculoMarca.find(id)
  }

  async create(data: { nombre: string }, user: User) {
    const nombre = data.nombre.trim()
    const existing = await VehiculoMarca.query().whereILike('nombre', nombre).first()
    if (existing) {
      throw new Error('NOMBRE_DUPLICADO')
    }

    const marca = await VehiculoMarca.create({ nombre })
    await EntityCreated.dispatch({
      userId: user.id,
      entityType: this.entityType,
      entityId: marca.id,
      newValues: { nombre: marca.nombre },
    })
    return marca
  }

  async update(id: string, data: { nombre: string }, user: User) {
    const marca = await VehiculoMarca.find(id)
    if (!marca) return null

    const nombre = data.nombre.trim()
    const existing = await VehiculoMarca.query()
      .whereILike('nombre', nombre)
      .whereNot('id', id)
      .first()
    if (existing) {
      throw new Error('NOMBRE_DUPLICADO')
    }

    const oldValues = { nombre: marca.nombre }
    marca.nombre = nombre
    await marca.save()

    await EntityUpdated.dispatch({
      userId: user.id,
      entityType: this.entityType,
      entityId: marca.id,
      oldValues,
      newValues: { nombre: marca.nombre },
    })
    return marca
  }

  async delete(id: string, user: User) {
    const marca = await VehiculoMarca.find(id)
    if (!marca) return false

    const modelosCount = await VehiculoModelo.query().where('marca_id', id).count('* as total')
    const vehiculosCount = await Vehiculo.query().where('marca_id', id).count('* as total')

    if (Number(modelosCount[0].$extras.total) > 0 || Number(vehiculosCount[0].$extras.total) > 0) {
      throw new Error('EN_USO')
    }

    await marca.delete()
    await EntityDeleted.dispatch({
      userId: user.id,
      entityType: this.entityType,
      entityId: id,
      oldValues: { nombre: marca.nombre },
    })
    return true
  }
}
