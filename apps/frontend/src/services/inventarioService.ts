import type {
  IProducto,
  ICategoriaProducto,
  IStockMovimiento,
  IStockDisponibilidad,
  CreateProductoDTO,
  UpdateProductoDTO,
  MovimientoStockDTO,
  IPaginationParams,
  IListMovimientosParams,
  CreateCategoriaProductoDTO,
  UpdateCategoriaProductoDTO,
} from '@gnc/shared-types'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client'

export const inventarioService = {
  list(params?: IPaginationParams & { stockBajo?: boolean }) {
    const query = params
      ? {
          ...params,
          stockBajo: params.stockBajo ? '1' : undefined,
        }
      : undefined
    return apiGet<IProducto[]>('/inventario/productos', query)
  },

  getById(id: string) {
    return apiGet<IProducto>(`/inventario/productos/${id}`)
  },

  create(data: CreateProductoDTO) {
    return apiPost<IProducto>('/inventario/productos', data)
  },

  update(id: string, data: UpdateProductoDTO) {
    return apiPut<IProducto>(`/inventario/productos/${id}`, data)
  },

  remove(id: string) {
    return apiDelete<void>(`/inventario/productos/${id}`)
  },

  movimiento(data: MovimientoStockDTO) {
    return apiPost<IProducto>('/inventario/movimientos', data)
  },

  listMovimientos(params?: IListMovimientosParams) {
    return apiGet<IStockMovimiento[]>('/inventario/movimientos', params)
  },

  getDisponibilidad(productoId: string, excludeOtItemId?: string) {
    return apiGet<IStockDisponibilidad>(`/inventario/productos/${productoId}/disponibilidad`, {
      excludeOtItemId,
    })
  },

  alertas() {
    return apiGet<IProducto[]>('/inventario/alertas')
  },

  categorias() {
    return apiGet<ICategoriaProducto[]>('/inventario/categorias')
  },

  createCategoria(data: CreateCategoriaProductoDTO) {
    return apiPost<ICategoriaProducto>('/inventario/categorias', data)
  },

  updateCategoria(id: string, data: UpdateCategoriaProductoDTO) {
    return apiPut<ICategoriaProducto>(`/inventario/categorias/${id}`, data)
  },

  removeCategoria(id: string) {
    return apiDelete<void>(`/inventario/categorias/${id}`)
  },
}
