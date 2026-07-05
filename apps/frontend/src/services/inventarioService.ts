import type {
  IProducto,
  ICategoriaProducto,
  CreateProductoDTO,
  UpdateProductoDTO,
  MovimientoStockDTO,
  IPaginationParams,
} from '@gnc/shared-types'
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api-client'

export const inventarioService = {
  list(params?: IPaginationParams) {
    return apiGet<IProducto[]>('/inventario/productos', params)
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

  alertas() {
    return apiGet<IProducto[]>('/inventario/alertas')
  },

  categorias() {
    return apiGet<ICategoriaProducto[]>('/inventario/categorias')
  },

  createCategoria(data: { nombre: string; descripcion?: string }) {
    return apiPost<ICategoriaProducto>('/inventario/categorias', data)
  },
}
