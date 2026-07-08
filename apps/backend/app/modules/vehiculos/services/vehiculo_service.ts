import type { CreateVehicleDTO, IVehiculoFichaOperativa, UpdateVehicleDTO } from '@gnc/shared-types'
import type { IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import type Vehiculo from '#models/vehiculo'
import { DateTime } from 'luxon'
import VehiculoModelo from '#models/vehiculo_modelo'
import EquipoGnc from '#models/equipo_gnc'
import OrdenTrabajo from '#models/orden_trabajo'
import { BaseService } from '#shared/base_service'
import { isPgUniqueViolation } from '#shared/db_error_util'
import { sumSenasByOrdenTrabajoIds } from '#shared/ot_sena_util'
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

  async getFichaOperativa(vehiculoId: string): Promise<IVehiculoFichaOperativa | null> {
    const vehiculo = await this.repository.findByIdWithRelations(vehiculoId)
    if (!vehiculo) return null

    const hoy = DateTime.now().startOf('day')

    const equipos = await EquipoGnc.query()
      .where('vehiculo_id', vehiculoId)
      .whereNull('deleted_at')
      .preload('cilindros', (query) => query.whereNull('deleted_at'))

    const ordenes = await OrdenTrabajo.query()
      .where('vehiculo_id', vehiculoId)
      .whereNull('deleted_at')
      .preload('tipoTrabajo')
      .preload('equipoGnc')
      .orderBy('fecha_ingreso', 'desc')
      .limit(15)

    const senasPorOt = await sumSenasByOrdenTrabajoIds(ordenes.map((orden) => orden.id))

    return {
      id: vehiculo.id,
      clienteId: vehiculo.clienteId,
      clienteNombre: vehiculo.cliente?.razonSocial ?? '',
      patente: vehiculo.patente,
      marcaNombre: vehiculo.marca?.nombre,
      modeloNombre: vehiculo.modelo?.nombre,
      anio: vehiculo.anio,
      color: vehiculo.color ?? undefined,
      tipoCombustible: vehiculo.tipoCombustible,
      kilometraje: vehiculo.kilometraje ?? undefined,
      isActive: vehiculo.isActive,
      equipos: equipos.map((equipo) => {
        const obleaVencida = equipo.fechaVencimientoOblea.startOf('day') < hoy
        const cilindrosActivos = (equipo.cilindros ?? []).filter((c) => c.estado !== 'retirado')
        const phVencida = cilindrosActivos.some((c) => c.fechaVencimientoPh.startOf('day') < hoy)

        return {
          id: equipo.id,
          numeroSerieEquipo: equipo.numeroSerieEquipo,
          estado: equipo.estado,
          fechaVencimientoOblea: equipo.fechaVencimientoOblea.toISODate()!,
          obleaVencida,
          phVencida,
        }
      }),
      ordenesRecientes: ordenes.map((orden) => ({
        id: orden.id,
        numero: orden.numero,
        estado: orden.estado,
        tipoTrabajoNombre: orden.tipoTrabajo?.nombre,
        equipoGncNumeroSerie: orden.equipoGnc?.numeroSerieEquipo,
        fechaIngreso: orden.fechaIngreso.toISO()!,
        totalEstimado: orden.totalEstimado ? Number(orden.totalEstimado) : undefined,
        totalSena: senasPorOt.get(orden.id) ?? undefined,
      })),
    }
  }

  async create(data: CreateVehicleDTO, user: User): Promise<Vehiculo> {
    const patente = data.patente.trim().toUpperCase()
    const existing = await this.repository.findByPatente(patente)
    if (existing) {
      throw new Error('PATENTE_DUPLICADA')
    }

    await this.assertModeloPerteneceAMarca(data.marcaId, data.modeloId)

    try {
      const vehiculo = await super.create(
        {
          ...data,
          patente,
          isActive: true,
        },
        user
      )

      const withRelations = await this.repository.findByIdWithRelations(vehiculo.id)
      if (!withRelations) {
        throw new Error('VEHICULO_NO_PERSISTIDO')
      }

      return withRelations
    } catch (error) {
      if (isPgUniqueViolation(error)) {
        throw new Error('PATENTE_DUPLICADA')
      }
      throw error
    }
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

    try {
      const updated = await super.update(id, updateData, user)
      if (!updated) return null

      return this.repository.findByIdWithRelations(updated.id)
    } catch (error) {
      if (isPgUniqueViolation(error)) {
        throw new Error('PATENTE_DUPLICADA')
      }
      throw error
    }
  }

  private async assertModeloPerteneceAMarca(marcaId: string, modeloId: string): Promise<void> {
    const modelo = await VehiculoModelo.find(modeloId)
    if (!modelo || modelo.marcaId !== marcaId) {
      throw new Error('MODELO_INVALIDO')
    }
  }
}
