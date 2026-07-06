import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { RoleName } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'

export default class RoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    allowedRoles: RoleName[] = []
  ) {
    const user = ctx.auth.user
    if (!user) {
      return ctx.response.unauthorized(
        ApiResponse.error('UNAUTHORIZED', 'No autenticado')
      )
    }

    await user.load('roles')
    const userRoleNames = user.roles.map((role) => role.name as RoleName)
    const hasAccess = allowedRoles.some((role) => userRoleNames.includes(role))

    if (!hasAccess) {
      return ctx.response.forbidden(
        ApiResponse.error('FORBIDDEN', 'No tenés permisos para esta acción')
      )
    }

    return next()
  }
}
