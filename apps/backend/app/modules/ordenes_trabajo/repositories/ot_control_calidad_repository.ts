import OtControlCalidad from '#models/ot_control_calidad'

export default class OtControlCalidadRepository {
  async findByOrdenTrabajoId(ordenTrabajoId: string): Promise<OtControlCalidad | null> {
    return OtControlCalidad.query()
      .where('orden_trabajo_id', ordenTrabajoId)
      .preload('aprobadoPor')
      .first()
  }

  async upsert(
    ordenTrabajoId: string,
    data: Partial<OtControlCalidad>
  ): Promise<OtControlCalidad> {
    const existing = await OtControlCalidad.query().where('orden_trabajo_id', ordenTrabajoId).first()

    if (existing) {
      existing.merge(data)
      await existing.save()
      await existing.load('aprobadoPor')
      return existing
    }

    const registro = await OtControlCalidad.create({
      ordenTrabajoId,
      ...data,
    })
    await registro.load('aprobadoPor')
    return registro
  }
}
