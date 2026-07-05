import type { HttpContext } from '@adonisjs/core/http'
import type { IPaginationParams } from '@gnc/shared-types'
import { ApiResponse } from '#shared/api_response'
import ProductoService from '#modules/inventario/services/producto_service'
import { createProductoValidator } from '#modules/inventario/validators/create_producto_validator'
import { updateProductoValidator } from '#modules/inventario/validators/update_producto_validator'
import { movimientoStockValidator } from '#modules/inventario/validators/movimiento_stock_validator'
import { createCategoriaValidator } from '#modules/inventario/validators/create_categoria_validator'

const productoService = new ProductoService()

export default class InventarioController {
  async index({ request, response }: HttpContext) {
    const params: IPaginationParams = {
      page: Number(request.input('page', 1)),
      perPage: Number(request.input('perPage', 20)),
      search: request.input('search'),
      sortBy: request.input('sortBy'),
      sortOrder: request.input('sortOrder'),
    }

    const result = await productoService.list(params)
    return response.ok(ApiResponse.paginated(result.data, result.meta as never))
  }

  async show({ params, response }: HttpContext) {
    const producto = await productoService.getById(params.id)
    if (!producto) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Producto no encontrado'))
    }
    return response.ok(ApiResponse.success(producto))
  }

  async store({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(createProductoValidator)
    try {
      const producto = await productoService.create(dto, auth.user!)
      return response.created(ApiResponse.created(producto))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async update({ params, request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(updateProductoValidator)
    try {
      const producto = await productoService.update(params.id, dto, auth.user!)
      if (!producto) {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Producto no encontrado'))
      }
      return response.ok(ApiResponse.success(producto))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async destroy({ params, auth, response }: HttpContext) {
    const deleted = await productoService.delete(params.id, auth.user!)
    if (!deleted) {
      return response.notFound(ApiResponse.error('NOT_FOUND', 'Producto no encontrado'))
    }
    return response.ok(ApiResponse.success({ message: 'Producto eliminado' }))
  }

  async movimiento({ request, auth, response }: HttpContext) {
    const dto = await request.validateUsing(movimientoStockValidator)
    try {
      const producto = await productoService.registrarMovimiento(dto, auth.user!)
      return response.ok(ApiResponse.success(producto))
    } catch (error) {
      return this.handleError(error, response)
    }
  }

  async alertas({ response }: HttpContext) {
    const productos = await productoService.alertasStock()
    return response.ok(ApiResponse.success(productos))
  }

  async categorias({ response }: HttpContext) {
    const categorias = await productoService.listCategorias()
    return response.ok(ApiResponse.success(categorias))
  }

  async storeCategoria({ request, response }: HttpContext) {
    const dto = await request.validateUsing(createCategoriaValidator)
    const categoria = await productoService.createCategoria(dto)
    return response.created(ApiResponse.created(categoria))
  }

  private handleError(error: unknown, response: HttpContext['response']) {
    if (error instanceof Error) {
      if (error.message === 'CODIGO_DUPLICADO') {
        return response.conflict(
          ApiResponse.error('CODIGO_DUPLICADO', 'Ya existe un producto con ese código')
        )
      }
      if (error.message === 'PRODUCTO_NO_ENCONTRADO') {
        return response.notFound(ApiResponse.error('NOT_FOUND', 'Producto no encontrado'))
      }
      if (error.message === 'STOCK_INSUFICIENTE') {
        return response.badRequest(
          ApiResponse.error('STOCK_INSUFICIENTE', 'Stock insuficiente para el egreso')
        )
      }
    }
    throw error
  }
}
