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

function parseDate(value: string, fieldName: string): DateTime {
  const date = DateTime.fromISO(value, { zone: 'utc' }).startOf('day')
  if (!date.isValid) {
    throw new Error(`FECHA_INVALIDA:${fieldName}`)
  }
  return date
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  )
}

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
    if (!data.cilindros?.length) {
      throw new Error('CILINDROS_REQUERIDOS')
    }

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

    const fechaInstalacion = parseDate(data.fechaInstalacion, 'fechaInstalacion')
    const fechaVencimientoOblea = fechaInstalacion.plus({ years: OBLEA_YEARS })

    let equipoId = ''
    const trx = await db.transaction()

    try {
      const equipo = await EquipoGnc.create(
        {
          vehiculoId: data.vehiculoId,
          numeroSerieEquipo: data.numeroSerieEquipo.trim(),
          marcaRegulador: data.marcaRegulador.trim(),
          modeloRegulador: data.modeloRegulador.trim(),
          fechaInstalacion,
          fechaVencimientoOblea,
          estado: 'activo',
          certificadorCrpc: data.certificadorCrpc?.trim() || null,
          notas: data.notas?.trim() || null,
        },
        { client: trx }
      )

      equipoId = equipo.id

      for (const cilindroData of data.cilindros) {
        const fechaUltimaPh = parseDate(cilindroData.fechaUltimaPh, 'fechaUltimaPh')
        const fechaVencimientoPh = fechaUltimaPh.plus({ years: PH_YEARS })
        const phVencida = fechaVencimientoPh.toMillis() < DateTime.utc().toMillis()

        await Cilindro.create(
          {
            equipoGncId: equipo.id,
            numeroSerie: cilindroData.numeroSerie.trim(),
            capacidadM3: Number(cilindroData.capacidadM3),
            marca: cilindroData.marca.trim(),
            fechaFabricacion: cilindroData.fechaFabricacion
              ? parseDate(cilindroData.fechaFabricacion, 'fechaFabricacion')
              : null,
            fechaUltimaPh,
            fechaVencimientoPh,
            estado: phVencida ? 'vencido' : 'activo',
            posicion: Number(cilindroData.posicion),
          },
          { client: trx }
        )
      }

      await trx.commit()
    } catch (error) {
      await trx.rollback()

      if (isUniqueViolation(error)) {
        throw new Error('SERIE_DUPLICADA')
      }

      throw error
    }

    try {
      const { EntityCreated } = await import('#events/audit_events')
      await EntityCreated.dispatch({
        userId: user.id,
        entityType: this.entityType,
        entityId: equipoId,
        newValues: {
          numeroSerieEquipo: data.numeroSerieEquipo.trim(),
          vehiculoId: data.vehiculoId,
        },
      })
    } catch {
      // La auditoría no debe impedir el alta del equipo.
    }

    return (await this.repository.findByIdWithCilindros(equipoId))!
  }

  static calcularVencimientoOblea(fechaInstalacion: DateTime): DateTime {
    return fechaInstalacion.plus({ years: OBLEA_YEARS })
  }

  static calcularVencimientoPh(fechaUltimaPh: DateTime): DateTime {
    return fechaUltimaPh.plus({ years: PH_YEARS })
  }
}
