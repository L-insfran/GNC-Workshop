import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import Cliente from '#models/cliente'
import { BaseRepository } from '#shared/base_repository'

export default class ClienteRepository extends BaseRepository<Cliente> {
  protected model = Cliente

  protected applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow> {
    return query.where((builder) => {
      builder
        .whereILike('razon_social', `%${search}%`)
        .orWhereILike('documento_numero', `%${search}%`)
        .orWhereILike('email', `%${search}%`)
        .orWhereILike('nombre', `%${search}%`)
        .orWhereILike('apellido', `%${search}%`)
    })
  }

  async findByDocumento(documentoNumero: string): Promise<Cliente | null> {
    return Cliente.query()
      .where('documento_numero', documentoNumero)
      .whereNull('deleted_at')
      .first()
  }
}
