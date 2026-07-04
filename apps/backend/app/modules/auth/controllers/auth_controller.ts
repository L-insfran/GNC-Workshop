import type { HttpContext } from '@adonisjs/core/http'
import { ApiResponse } from '#shared/api_response'
import AuthService from '#modules/auth/services/auth_service'

const authService = new AuthService()

export default class AuthController {
  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    if (!email || !password) {
      return response.badRequest(
        ApiResponse.error('VALIDATION_ERROR', 'Email y contraseña son requeridos')
      )
    }

    try {
      const result = await authService.login({ email, password })
      return response.ok(ApiResponse.success(result))
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_INACTIVE') {
        return response.forbidden(
          ApiResponse.error('USER_INACTIVE', 'El usuario está desactivado')
        )
      }
      return response.unauthorized(
        ApiResponse.error('INVALID_CREDENTIALS', 'Credenciales inválidas')
      )
    }
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.user!
    const token = user.currentAccessToken

    if (token?.identifier) {
      await authService.logout(user, token.identifier)
    }

    return response.ok(ApiResponse.success({ message: 'Sesión cerrada correctamente' }))
  }

  async me({ auth, response }: HttpContext) {
    const user = await authService.me(auth.user!)
    return response.ok(ApiResponse.success(user))
  }
}
