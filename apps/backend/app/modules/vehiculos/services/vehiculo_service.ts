import type { CreateVehicleDTO } from '@gnc/shared-types'
import type { IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import type Vehiculo from '#models/vehiculo'
import VehiculoModelo from '#models/vehiculo_modelo'
import { BaseService } from '#shared/base_service'
import VehiculoRepository from '#modules/vehiculos/repositories/vehiculo_repository'

export default class VehiculoService extends BaseService<Vehiculo> {
  protected entityType = 'vehiculo'
  protected repository = new VehiculoRepository()

  async list(params?: IPaginationParams) {
    return this.repository.findAllWithRelations(params)
  }

  async getById(id: string): Promise<Vehiculo | null> {
    return this.repository.findByIdWithRelations(id)
  }

  async create(data: CreateVehicleDTO, user: User): Promise<Vehiculo> {
    const patente = data.patente.toUpperCase()
    const existing = await this.repository.findByPatente(patente)
    if (existing) {
      throw new Error('PATENTE_DUPLICADA')
    }

    const modelo = await VehiculoModelo.find(data.modeloId)
    if (!modelo || modelo.marcaId !== data.marcaId) {
      throw new Error('MODELO_INVALIDO')
    }

    const vehiculo = await super.create(
      {
        ...data,
        patente,
        isActive: true,
      },
      user
    )

    return (await this.repository.findByIdWithRelations(vehiculo.id))!
  }
}
