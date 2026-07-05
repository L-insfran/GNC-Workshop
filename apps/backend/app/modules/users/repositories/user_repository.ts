import type { LucidModel, LucidRow, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import User from '#models/user'
import { BaseRepository } from '#shared/base_repository'

export default class UserRepository extends BaseRepository<User> {
  protected model = User

  protected applySearch(
    query: ModelQueryBuilderContract<LucidModel, LucidRow>,
    search: string
  ): ModelQueryBuilderContract<LucidModel, LucidRow> {
    return query.where((builder) => {
      builder
        .whereILike('email', `%${search}%`)
        .orWhereILike('full_name', `%${search}%`)
        .orWhereILike('phone', `%${search}%`)
    })
  }

  async findByIdWithRoles(id: string): Promise<User | null> {
    return User.query().where('id', id).whereNull('deleted_at').preload('roles').first()
  }

  async findAllWithRoles(params = {}) {
    const result = await this.findAll(params)
    await Promise.all(result.data.map((user) => user.load('roles')))
    return result
  }

  async attachRoles(user: User, roleIds: string[]): Promise<void> {
    await user.related('roles').sync(roleIds)
  }
}
