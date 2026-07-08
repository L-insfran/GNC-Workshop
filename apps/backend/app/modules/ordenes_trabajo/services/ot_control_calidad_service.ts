import { DateTime } from 'luxon'
import { isControlCalidadCompleto, type UpsertOtControlCalidadDTO } from '@gnc/shared-types'
import type User from '#models/user'
import OrdenTrabajo from '#models/orden_trabajo'
import OtControlCalidadRepository from '#modules/ordenes_trabajo/repositories/ot_control_calidad_repository'
import { serializeOtControlCalidad } from '#shared/ot_control_calidad_serializer'

export default class OtControlCalidadService {
  private repository = new OtControlCalidadRepository()

  async getByOrdenTrabajoId(ordenTrabajoId: string) {
    const registro = await this.repository.findByOrdenTrabajoId(ordenTrabajoId)
    return registro ? serializeOtControlCalidad(registro) : null
  }

  async upsert(ordenTrabajoId: string, dto: UpsertOtControlCalidadDTO, user: User) {
    const orden = await OrdenTrabajo.query().where('id', ordenTrabajoId).whereNull('deleted_at').first()

    if (!orden) {
      throw new Error('OT_NO_ENCONTRADA')
    }

    if (orden.estado !== 'control_calidad') {
      throw new Error('OT_ESTADO_INVALIDO_QC')
    }

    const completo = isControlCalidadCompleto(dto)

    const registro = await this.repository.upsert(ordenTrabajoId, {
      sinFugas: dto.sinFugas,
      presionReguladorOk: dto.presionReguladorOk,
      valvulasSeguridadOk: dto.valvulasSeguridadOk,
      estanqueidadOk: dto.estanqueidadOk,
      documentacionCompleta: dto.documentacionCompleta,
      observaciones: dto.observaciones?.trim() || null,
      aprobadoPorId: completo ? user.id : null,
      aprobadoAt: completo ? DateTime.now() : null,
    })

    return serializeOtControlCalidad(registro)
  }

  async assertAprobadoParaFinalizar(ordenTrabajoId: string): Promise<void> {
    const registro = await this.repository.findByOrdenTrabajoId(ordenTrabajoId)

    if (!registro || !registro.completo) {
      throw new Error('CONTROL_CALIDAD_INCOMPLETO')
    }
  }
}
