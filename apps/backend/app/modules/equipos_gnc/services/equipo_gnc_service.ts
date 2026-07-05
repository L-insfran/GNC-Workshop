import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { CreateEquipoGncDTO } from '@gnc/shared-types'
import type { IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import type EquipoGnc from '#models/equipo_gnc'
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
    const now = DateTime.utc().toISO()

    const equipoId = randomUUID()

    try {
      await db.transaction(async (trx) => {
        await trx.table('equipos_gnc').insert({
          id: equipoId,
          vehiculo_id: data.vehiculoId,
          numero_serie_equipo: data.numeroSerieEquipo.trim(),
          marca_regulador: data.marcaRegulador.trim(),
          modelo_regulador: data.modeloRegulador.trim(),
          fecha_instalacion: fechaInstalacion.toISODate(),
          fecha_vencimiento_oblea: fechaVencimientoOblea.toISODate(),
          estado: 'activo',
          certificador_crpc: data.certificadorCrpc?.trim() || null,
          notas: data.notas?.trim() || null,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        })

        for (const cilindroData of data.cilindros) {
          const fechaUltimaPh = parseDate(cilindroData.fechaUltimaPh, 'fechaUltimaPh')
          const fechaVencimientoPh = fechaUltimaPh.plus({ years: PH_YEARS })
          const phVencida = fechaVencimientoPh.toMillis() < DateTime.utc().toMillis()

          await trx.table('cilindros').insert({
            id: randomUUID(),
            equipo_gnc_id: equipoId,
            numero_serie: cilindroData.numeroSerie.trim(),
            capacidad_m3: Number(cilindroData.capacidadM3),
            marca: cilindroData.marca.trim(),
            fecha_fabricacion: cilindroData.fechaFabricacion
              ? parseDate(cilindroData.fechaFabricacion, 'fechaFabricacion').toISODate()
              : null,
            fecha_ultima_ph: fechaUltimaPh.toISODate(),
            fecha_vencimiento_ph: fechaVencimientoPh.toISODate(),
            estado: phVencida ? 'vencido' : 'activo',
            posicion: Number(cilindroData.posicion),
            created_at: now,
            updated_at: now,
            deleted_at: null,
          })
        }
      })
    } catch (error) {
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

    const equipo = await this.repository.findByIdWithCilindros(equipoId)
    if (!equipo) {
      throw new Error('EQUIPO_NO_ENCONTRADO_POST_CREATE')
    }

    return equipo
  }

  static calcularVencimientoOblea(fechaInstalacion: DateTime): DateTime {
    return fechaInstalacion.plus({ years: OBLEA_YEARS })
  }

  static calcularVencimientoPh(fechaUltimaPh: DateTime): DateTime {
    return fechaUltimaPh.plus({ years: PH_YEARS })
  }
}
