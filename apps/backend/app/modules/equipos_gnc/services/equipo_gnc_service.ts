import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { CreateEquipoGncDTO, UpdateCilindroDTO, UpdateEquipoGncDTO } from '@gnc/shared-types'
import type { IPaginationParams } from '@gnc/shared-types'
import type User from '#models/user'
import type EquipoGnc from '#models/equipo_gnc'
import Vehiculo from '#models/vehiculo'
import EquipoGncModel from '#models/equipo_gnc'
import Cilindro from '#models/cilindro'
import { BaseService } from '#shared/base_service'
import { isPgUniqueViolation } from '#shared/db_error_util'
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

async function assertSeriesDisponibles(data: CreateEquipoGncDTO): Promise<void> {
  const numeroSerieEquipo = data.numeroSerieEquipo.trim()

  const equipoExistente = await EquipoGncModel.query()
    .where('numero_serie_equipo', numeroSerieEquipo)
    .whereNull('deleted_at')
    .first()

  if (equipoExistente) {
    throw new Error('SERIE_EQUIPO_DUPLICADA')
  }

  const seriesCilindros = data.cilindros.map((cilindro) => cilindro.numeroSerie.trim())

  if (new Set(seriesCilindros).size !== seriesCilindros.length) {
    throw new Error('SERIE_CILINDRO_DUPLICADA')
  }

  for (const numeroSerie of seriesCilindros) {
    const cilindroExistente = await Cilindro.query()
      .where('numero_serie', numeroSerie)
      .whereNull('deleted_at')
      .first()

    if (cilindroExistente) {
      throw new Error('SERIE_CILINDRO_DUPLICADA')
    }
  }
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

    await assertSeriesDisponibles(data)

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
          await this.insertCilindro(trx, equipoId, cilindroData, now)
        }
      })
    } catch (error) {
      if (isPgUniqueViolation(error)) {
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

  async update(id: string, data: UpdateEquipoGncDTO, user: User): Promise<EquipoGnc | null> {
    const existing = await this.repository.findById(id)
    if (!existing) return null

    const { cilindros, ...equipoFields } = data

    if (equipoFields.numeroSerieEquipo) {
      const numeroSerieEquipo = equipoFields.numeroSerieEquipo.trim()
      const equipoDuplicado = await EquipoGncModel.query()
        .where('numero_serie_equipo', numeroSerieEquipo)
        .whereNull('deleted_at')
        .whereNot('id', id)
        .first()

      if (equipoDuplicado) {
        throw new Error('SERIE_EQUIPO_DUPLICADA')
      }
    }

    const updatePayload: Partial<EquipoGnc> = {}

    if (equipoFields.numeroSerieEquipo !== undefined) {
      updatePayload.numeroSerieEquipo = equipoFields.numeroSerieEquipo.trim()
    }
    if (equipoFields.marcaRegulador !== undefined) {
      updatePayload.marcaRegulador = equipoFields.marcaRegulador.trim()
    }
    if (equipoFields.modeloRegulador !== undefined) {
      updatePayload.modeloRegulador = equipoFields.modeloRegulador.trim()
    }
    if (equipoFields.certificadorCrpc !== undefined) {
      updatePayload.certificadorCrpc = equipoFields.certificadorCrpc?.trim() || null
    }
    if (equipoFields.notas !== undefined) {
      updatePayload.notas = equipoFields.notas?.trim() || null
    }
    if (equipoFields.fechaInstalacion) {
      const fechaInstalacion = parseDate(equipoFields.fechaInstalacion, 'fechaInstalacion')
      updatePayload.fechaInstalacion = fechaInstalacion
      updatePayload.fechaVencimientoOblea = EquipoGncService.calcularVencimientoOblea(fechaInstalacion)
    }

    try {
      if (cilindros) {
        if (!cilindros.length) {
          throw new Error('CILINDROS_REQUERIDOS')
        }
        if (cilindros.length > MAX_CILINDROS) {
          throw new Error('MAX_CILINDROS_EXCEDIDO')
        }

        await db.transaction(async (trx) => {
          if (Object.keys(updatePayload).length > 0) {
            await trx
              .from('equipos_gnc')
              .where('id', id)
              .whereNull('deleted_at')
              .update({
                ...this.mapEquipoUpdateToDb(updatePayload),
                updated_at: DateTime.utc().toSQL(),
              })
          }

          await this.syncCilindros(id, cilindros, trx)
        })
      } else if (Object.keys(updatePayload).length > 0) {
        const updated = await super.update(id, updatePayload, user)
        if (!updated) return null
      }

      return this.repository.findByIdWithCilindros(id)
    } catch (error) {
      if (isPgUniqueViolation(error)) {
        throw new Error('SERIE_DUPLICADA')
      }
      throw error
    }
  }

  async delete(id: string, user: User): Promise<boolean> {
    const existing = await this.repository.findById(id)
    if (!existing) return false

    const now = DateTime.utc()

    await Cilindro.query()
      .where('equipo_gnc_id', id)
      .whereNull('deleted_at')
      .update({ deletedAt: now, updatedAt: now })

    return super.delete(id, user)
  }

  private mapEquipoUpdateToDb(data: Partial<EquipoGnc>): Record<string, unknown> {
    const payload: Record<string, unknown> = {}

    if (data.numeroSerieEquipo !== undefined) {
      payload.numero_serie_equipo = data.numeroSerieEquipo
    }
    if (data.marcaRegulador !== undefined) {
      payload.marca_regulador = data.marcaRegulador
    }
    if (data.modeloRegulador !== undefined) {
      payload.modelo_regulador = data.modeloRegulador
    }
    if (data.certificadorCrpc !== undefined) {
      payload.certificador_crpc = data.certificadorCrpc
    }
    if (data.notas !== undefined) {
      payload.notas = data.notas
    }
    if (data.fechaInstalacion !== undefined) {
      payload.fecha_instalacion = data.fechaInstalacion.toISODate()
    }
    if (data.fechaVencimientoOblea !== undefined) {
      payload.fecha_vencimiento_oblea = data.fechaVencimientoOblea.toISODate()
    }

    return payload
  }

  private async insertCilindro(
    trx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    equipoGncId: string,
    cilindroData: UpdateCilindroDTO,
    now: string
  ): Promise<void> {
    const fechaUltimaPh = parseDate(cilindroData.fechaUltimaPh, 'fechaUltimaPh')
    const fechaVencimientoPh = fechaUltimaPh.plus({ years: PH_YEARS })
    const phVencida = fechaVencimientoPh.toMillis() < DateTime.utc().toMillis()

    await trx.table('cilindros').insert({
      id: randomUUID(),
      equipo_gnc_id: equipoGncId,
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

  private async syncCilindros(
    equipoGncId: string,
    cilindros: UpdateCilindroDTO[],
    trx: Parameters<Parameters<typeof db.transaction>[0]>[0]
  ): Promise<void> {
    const existing = await Cilindro.query({ client: trx })
      .where('equipo_gnc_id', equipoGncId)
      .whereNull('deleted_at')

    const keptIds = new Set(
      cilindros.map((cilindro) => cilindro.id).filter((cilindroId): cilindroId is string => Boolean(cilindroId))
    )

    const series = cilindros.map((cilindro) => cilindro.numeroSerie.trim())
    if (new Set(series).size !== series.length) {
      throw new Error('SERIE_CILINDRO_DUPLICADA')
    }

    const now = DateTime.utc().toSQL()!

    for (const cilindro of existing) {
      if (!keptIds.has(cilindro.id)) {
        await trx.from('cilindros').where('id', cilindro.id).update({
          deleted_at: now,
          updated_at: now,
        })
      }
    }

    for (const cilindroData of cilindros) {
      const numeroSerie = cilindroData.numeroSerie.trim()

      const duplicateQuery = Cilindro.query({ client: trx })
        .where('numero_serie', numeroSerie)
        .whereNull('deleted_at')

      if (cilindroData.id) {
        duplicateQuery.whereNot('id', cilindroData.id)
      }

      const duplicate = await duplicateQuery.first()
      if (duplicate) {
        throw new Error('SERIE_CILINDRO_DUPLICADA')
      }

      const fechaUltimaPh = parseDate(cilindroData.fechaUltimaPh, 'fechaUltimaPh')
      const fechaVencimientoPh = fechaUltimaPh.plus({ years: PH_YEARS })
      const phVencida = fechaVencimientoPh.toMillis() < DateTime.utc().toMillis()

      const cilindroPayload = {
        numero_serie: numeroSerie,
        capacidad_m3: Number(cilindroData.capacidadM3),
        marca: cilindroData.marca.trim(),
        fecha_fabricacion: cilindroData.fechaFabricacion
          ? parseDate(cilindroData.fechaFabricacion, 'fechaFabricacion').toISODate()
          : null,
        fecha_ultima_ph: fechaUltimaPh.toISODate(),
        fecha_vencimiento_ph: fechaVencimientoPh.toISODate(),
        estado: phVencida ? 'vencido' : 'activo',
        posicion: Number(cilindroData.posicion),
        updated_at: now,
      }

      if (cilindroData.id) {
        const belongsToEquipo = existing.some((cilindro) => cilindro.id === cilindroData.id)
        if (!belongsToEquipo) {
          continue
        }

        await trx.from('cilindros').where('id', cilindroData.id).update(cilindroPayload)
      } else {
        await trx.table('cilindros').insert({
          id: randomUUID(),
          equipo_gnc_id: equipoGncId,
          ...cilindroPayload,
          created_at: now,
          deleted_at: null,
        })
      }
    }
  }

  static calcularVencimientoOblea(fechaInstalacion: DateTime): DateTime {
    return fechaInstalacion.plus({ years: OBLEA_YEARS })
  }

  static calcularVencimientoPh(fechaUltimaPh: DateTime): DateTime {
    return fechaUltimaPh.plus({ years: PH_YEARS })
  }
}
