import { DateTime } from 'luxon'
import type { IAuthResponse, IAuthUser, ILoginDTO } from '@gnc/shared-types'
import { ROLES, type RoleName } from '@gnc/shared-types'
import User from '#models/user'

export default class AuthService {
  async login(dto: ILoginDTO): Promise<IAuthResponse> {
    const user = await User.verifyCredentials(dto.email, dto.password)

    if (!user.isActive) {
      throw new Error('USER_INACTIVE')
    }

    await user.load('roles')
    const token = await User.accessTokens.create(user, ['*'])

    user.merge({ lastLoginAt: DateTime.now() })
    await user.save()

    return {
      token: token.value!.release(),
      user: this.toAuthUser(user),
    }
  }

  async logout(user: User, tokenId: string | number | bigint): Promise<void> {
    await User.accessTokens.delete(user, tokenId)
  }

  async me(user: User): Promise<IAuthUser> {
    await user.load('roles')
    return this.toAuthUser(user)
  }

  private toAuthUser(user: User): IAuthUser {
    const roles = user.roles.map((role) => ({
      id: role.id,
      name: role.name as RoleName,
      displayName: role.displayName,
      description: role.description ?? undefined,
    }))

    const primaryRole =
      roles.find((role) => role.name === ROLES.ADMINISTRADOR)?.name ??
      roles[0]?.name ??
      ROLES.INVITADO

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: primaryRole,
      roles,
      avatarUrl: user.avatarUrl ?? undefined,
    }
  }
}
