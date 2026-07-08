import TipoTrabajo from '#models/tipo_trabajo'
import OrdenTrabajo from '#models/orden_trabajo'

export default class TipoTrabajoRepository {
  async findAll(includeInactive = false): Promise<TipoTrabajo[]> {
    const query = TipoTrabajo.query().orderBy('nombre', 'asc')
    if (!includeInactive) {
      query.where('is_active', true)
    }
    return query
  }

  async findById(id: string): Promise<TipoTrabajo | null> {
    return TipoTrabajo.find(id)
  }

  async countOrdenesByTipo(id: string): Promise<number> {
    const result = await OrdenTrabajo.query()
      .where('tipo_trabajo_id', id)
      .whereNull('deleted_at')
      .count('* as total')
    return Number(result[0].$extras.total)
  }
}
