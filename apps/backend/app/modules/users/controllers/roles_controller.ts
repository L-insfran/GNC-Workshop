import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import { ApiResponse } from '#shared/api_response'

export default class RolesController {
  async index({ response }: HttpContext) {
    const roles = await Role.query().orderBy('display_name', 'asc')
    return response.ok(ApiResponse.success(roles))
  }
}
