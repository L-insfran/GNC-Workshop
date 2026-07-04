import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { CreateEquipoGncDTO } from '@gnc/shared-types'
import type { IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import type EquipoGnc from '#models/equipo_gnc'
import Cilindro from '#models/cilindro'
import Vehiculo from '#models/vehiculo'
import { BaseService } from '#shared/base_service'
import EquipoGncRepository from '#modules/equipos_gnc/repositories/equipo_gnc_repository'

const OBLEA_YEARS = 1
const PH_YEARS = 5
const MAX_CILINDROS = 4

export default class EquipoGncService extends BaseService<EquipoGnc> {
  protected entityType = 'equipo_gnc'
  protected repository = new EquipoGncRepository()

  async list(params?: IPaginationParams) {
    return this.repository.findAllWithCilindros(params)
  }

  async getById(id: string): Promise<EquipoGnc | null> {
    return this.repository.findByIdWithCilindros(id)
  }

  async create(data: CreateEquipoGncDTO, user: User): Promise<EquipoGnc> {
    if (data.cilindros.length > MAX_CILINDROS) {
      throw new Error('MAX_CILINDROS_EXCEDIDO')
    }

    const vehiculo = await Vehiculo.query()
      .where('id', data.vehiculoId)
      .whereNull('deleted_at')
      .first()

    if (!vehiculo) {
      throw new Error('VEHICULO_NO_ENCONTRADO')
    }

    const fechaInstalacion = DateTime.fromISO(data.fechaInstalacion)
    const fechaVencimientoOblea = fechaInstalacion.plus({ years: OBLEA_YEARS })

    const trx = await db.transaction()

    try {
      const equipo = await EquipoGnc.create(
        {
          vehiculoId: data.vehiculoId,
          numeroSerieEquipo: data.numeroSerieEquipo,
          marcaRegulador: data.marcaRegulador,
          modeloRegulador: data.modeloRegulador,
          fechaInstalacion,
          fechaVencimientoOblea,
          estado: 'activo',
          certificadorCrpc: data.certificadorCrpc ?? null,
          notas: data.notas ?? null,
        },
        { client: trx }
      )

      for (const cilindroData of data.cilindros) {
        const fechaUltimaPh = DateTime.fromISO(cilindroData.fechaUltimaPh)
        const fechaVencimientoPh = fechaUltimaPh.plus({ years: PH_YEARS })
        const phVencida = fechaVencimientoPh < DateTime.now()

        await Cilindro.create(
          {
            equipoGncId: equipo.id,
            numeroSerie: cilindroData.numeroSerie,
            capacidadM3: cilindroData.capacidadM3,
            marca: cilindroData.marca,
            fechaFabricacion: cilindroData.fechaFabricacion
              ? DateTime.fromISO(cilindroData.fechaFabricacion)
              : null,
            fechaUltimaPh,
            fechaVencimientoPh,
            estado: phVencida ? 'vencido' : 'activo',
            posicion: cilindroData.posicion,
          },
          { client: trx }
        )
      }

      await trx.commit()

      const { default: emitter } = await import('@adonisjs/core/services/emitter')
      const { EntityCreated } = await import('#events/audit_events')
      await emitter.emit(EntityCreated, {
        userId: user.id,
        entityType: this.entityType,
        entityId: equipo.id,
        newValues: { numeroSerieEquipo: equipo.numeroSerieEquipo },
      })

      return (await this.repository.findByIdWithCilindros(equipo.id))!
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  static calcularVencimientoOblea(fechaInstalacion: DateTime): DateTime {
    return fechaInstalacion.plus({ years: OBLEA_YEARS })
  }

  static calcularVencimientoPh(fechaUltimaPh: DateTime): DateTime {
    return fechaUltimaPh.plus({ years: PH_YEARS })
  }
}
