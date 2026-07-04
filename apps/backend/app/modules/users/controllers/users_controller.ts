import type { HttpContext } from '@adonisjs/core/http'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import UserService from '#modules/users/services/user_service'
import { createUserValidator } from '#modules/users/validators/create_user_validator'
import { updateUserValidator } from '#modules/users/validators/update_user_validator'

const userService = new UserService()

export default class UsersController {
  async index({ request, response }: HttpContext) {
    const params: IPaginationParams = {
      page: Number(request.input('page', 1)),
      perPage: Number(request.input('perPage', 20)),
      search: request.input('search'),
      sortBy: request.input('sortBy'),
      sortOrder: request.input('sortOrder'),
    }

    const result = await userService.list(params)
    return response.ok(ApiResponse.paginated(result.data, result.meta as never))
  }

  async show({ params, response }: HttpContext) {
    const user = await userService.getById(params.id)
    if (!user) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Usuario no encontrado'))
    }
    return response.ok(ApiResponse.success(user))
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createUserValidator)
    const user = await userService.create(dto, auth.user!)
    return response.created(ApiResponse.created(user))
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateUserValidator)
    const user = await userService.update(params.id, dto, auth.user!)
    if (!user) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Usuario no encontrado'))
    }
    return response.ok(ApiResponse.success(user))
  }

  async destroy({ params, auth, response }: HttpContext) {
    const deleted = await userService.delete(params.id, auth.user!)
    if (!deleted) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Usuario no encontrado'))
    }
    return response.ok(ApiResponse.success({ message: 'Usuario eliminado' }))
  }
}
