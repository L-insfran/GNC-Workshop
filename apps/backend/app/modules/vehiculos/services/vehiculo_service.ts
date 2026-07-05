import type { CreateVehicleDTO, UpdateVehicleDTO } from '@gnc/shared-types'
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

    await this.assertModeloPerteneceAMarca(data.marcaId, data.modeloId)

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

  async update(id: string, data: UpdateVehicleDTO, user: User): Promise<Vehiculo | null> {
    const existing = await this.repository.findById(id)
    if (!existing) return null

    const updateData: Partial<Vehiculo> = { ...data }

    if (data.patente) {
      const patente = data.patente.toUpperCase()
      const duplicado = await this.repository.findByPatente(patente)
      if (duplicado && duplicado.id !== id) {
        throw new Error('PATENTE_DUPLICADA')
      }
      updateData.patente = patente
    }

    const marcaId = data.marcaId ?? existing.marcaId
    const modeloId = data.modeloId ?? existing.modeloId
    if (data.marcaId || data.modeloId) {
      await this.assertModeloPerteneceAMarca(marcaId, modeloId)
    }

    const updated = await super.update(id, updateData, user)
    if (!updated) return null

    return this.repository.findByIdWithRelations(updated.id)
  }

  private async assertModeloPerteneceAMarca(marcaId: string, modeloId: string): Promise<void> {
    const modelo = await VehiculoModelo.find(modeloId)
    if (!modelo || modelo.marcaId !== marcaId) {
      throw new Error('MODELO_INVALIDO')
    }
  }
}
