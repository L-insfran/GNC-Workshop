import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Role from '#models/role'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare fullName: string

  @column()
  declare phone: string | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'role_id',
  })
  declare roles: ManyToMany<typeof Role>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
