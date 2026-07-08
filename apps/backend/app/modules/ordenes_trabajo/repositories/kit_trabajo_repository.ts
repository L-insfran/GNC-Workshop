import KitTrabajoItem from '#models/kit_trabajo_item'

export default class KitTrabajoRepository {
  async findByTipoTrabajoId(tipoTrabajoId: string): Promise<KitTrabajoItem[]> {
    return KitTrabajoItem.query()
      .where('tipo_trabajo_id', tipoTrabajoId)
      .preload('producto')
      .orderBy('orden', 'asc')
      .orderBy('created_at', 'asc')
  }

  async findById(id: string): Promise<KitTrabajoItem | null> {
    return KitTrabajoItem.query().where('id', id).preload('producto').first()
  }

  async create(data: Partial<KitTrabajoItem>): Promise<KitTrabajoItem> {
    const item = await KitTrabajoItem.create(data)
    return (await this.findById(item.id))!
  }

  async update(id: string, data: Partial<KitTrabajoItem>): Promise<KitTrabajoItem | null> {
    const item = await KitTrabajoItem.find(id)
    if (!item) return null
    item.merge(data)
    await item.save()
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const item = await KitTrabajoItem.find(id)
    if (!item) return false
    await item.delete()
    return true
  }

  async nextOrden(tipoTrabajoId: string): Promise<number> {
    const last = await KitTrabajoItem.query()
      .where('tipo_trabajo_id', tipoTrabajoId)
      .orderBy('orden', 'desc')
      .first()

    return last ? Number(last.orden) + 1 : 0
  }
}
